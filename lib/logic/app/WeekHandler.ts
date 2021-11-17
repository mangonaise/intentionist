import { container, singleton } from 'tsyringe'
import { makeAutoObservable, runInAction, when } from 'mobx'
import { deleteField, increment } from '@firebase/firestore'
import { InitialState } from '@/logic/app/InitialFetchHandler'
import { formatFirstDayOfThisWeek } from '@/logic/utils/dateUtilities'
import HabitsHandler, { Habit } from '@/logic/app/HabitsHandler'
import DbHandler from '@/logic/app/DbHandler'
import FriendActivityHandler from '@/logic/app/FriendActivityHandler'
import isEqual from 'lodash/isEqual'
import sum from 'lodash/sum'

export type WeekDocumentData = {
  startDate: string,
  icon?: string | null,
  statuses?: {
    [habitId: string]: {
      [day in WeekdayId]?: string[]
    }
  },
  times?: {
    [habitId: string]: {
      [day in WeekdayId]?: number
    }
  }
  notes?: {
    [habitId: string]: string[]
  }
  notesMetadata?: {
    [noteId: string]: NoteMetadata
  }
}

export type NoteMetadata = {
  title: string,
  icon: string
}

export type WeekdayId = 0 | 1 | 2 | 3 | 4 | 5 | 6
export type WeekViewMode = 'tracker' | 'notes' | 'focus'

@singleton()
export default class WeekHandler {
  public viewMode = 'tracker' as WeekViewMode
  public weekInView: WeekInView
  public isLoadingWeek = false
  public latestWeekStartDate: string
  private dbHandler
  private habitsHandler
  private friendActivityHandler

  constructor(initialAppState: InitialState, dbHandler: DbHandler, habitsHandler: HabitsHandler, friendActivityHandler: FriendActivityHandler) {
    const thisWeekStartDate = formatFirstDayOfThisWeek()
    this.dbHandler = dbHandler
    this.habitsHandler = habitsHandler
    this.friendActivityHandler = friendActivityHandler

    this.latestWeekStartDate = initialAppState.data.latestWeekDoc?.startDate ?? thisWeekStartDate

    this.weekInView = new WeekInView({
      userHabits: habitsHandler.habits,
      data: initialAppState.data.latestWeekDoc ?? { startDate: thisWeekStartDate }
    }, this)

    makeAutoObservable(this)
  }

  public setViewMode = (viewMode: WeekViewMode) => {
    this.viewMode = viewMode
    this.weekInView.refreshHabitsInView()
  }

  public viewWeek = async ({ startDate, friendUid, cachedIcon }: { startDate: string, friendUid?: string, cachedIcon?: string }) => {
    if (startDate === this.weekInView.data.startDate && friendUid === this.weekInView.friendUid) return

    this.isLoadingWeek = true
    this.weekInView = new WeekInView({
      loadingState: this.weekInView,
      userHabits: [],
      data: { startDate, icon: cachedIcon },
      friendUid
    }, this)

    await when(() => this.dbHandler.isWriteComplete)

    let weekData: WeekDocumentData
    let habits: Habit[]

    if (friendUid) {
      [weekData, habits] = await this.friendActivityHandler.listenToFriendActivity(startDate, friendUid, this)
    } else {
      weekData = await this.dbHandler.getWeekDoc(startDate, friendUid) ?? { startDate }
      habits = this.habitsHandler.habits
      this.friendActivityHandler.stopListeningToFriendActivity()
    }

    runInAction(() => {
      if (!friendUid && new Date(startDate) > new Date(this.latestWeekStartDate)) {
        this.latestWeekStartDate = startDate
        this.dbHandler.updateWeekDoc(startDate, {})
      }
      this.weekInView = new WeekInView({
        friendUid,
        data: weekData,
        userHabits: habits.map((habit) => ({ ...habit, friendUid }))
      }, this)
      this.isLoadingWeek = false
    })
  }
}

interface WeekInViewConstructor {
  data: WeekDocumentData,
  userHabits: Habit[]
  friendUid?: string,
  loadingState?: WeekInView
}

export class WeekInView {
  public data: WeekDocumentData
  public userHabits: Habit[]
  public habitsInView: Habit[]
  public friendUid?: string
  public condenseView: boolean
  public showCondenseViewToggle = false
  private isPastWeek
  private dbHandler
  private weekHandler

  constructor({ friendUid, data, userHabits, loadingState }: WeekInViewConstructor, weekHandler: WeekHandler) {
    this.friendUid = friendUid
    this.data = data
    this.userHabits = userHabits
    this.weekHandler = weekHandler
    this.dbHandler = container.resolve(DbHandler)

    if (friendUid) {
      this.isPastWeek = data.startDate < formatFirstDayOfThisWeek()
    } else {
      this.isPastWeek = data.startDate < weekHandler.latestWeekStartDate
    }

    if (loadingState) {
      this.condenseView = loadingState.condenseView
      this.showCondenseViewToggle = loadingState.showCondenseViewToggle
      this.habitsInView = loadingState.habitsInView
    } else {
      this.condenseView = this.isPastWeek && userHabits.some((habit) => habit.status === 'active')
      this.habitsInView = this.refreshHabitsInView(userHabits)
    }

    makeAutoObservable(this)
  }

  public refreshWeekData = (newData: WeekDocumentData) => {
    this.data = newData
  }

  public refreshHabitsInView = (newHabits?: Habit[]) => {
    this.userHabits = newHabits ?? this.userHabits

    const habitHasData = (habit: Habit) => this.getHabitIdsWithData().includes(habit.id)
    this.habitsInView = this.userHabits
      .filter((habit) => this.condenseView ? habitHasData(habit) : (habit.status === 'active' || habitHasData(habit)))

    if (this.weekHandler.viewMode === 'focus') {
      this.habitsInView = this.habitsInView.filter((habit) => habit.timeable)
    }

    const activeHabits = this.userHabits.filter((habit) => habit.status === 'active')
    const doAllActiveHabitsHaveData = activeHabits.every(habitHasData)
    this.showCondenseViewToggle = this.isPastWeek && !doAllActiveHabitsHaveData

    return this.habitsInView
  }

  public setCondensedView = (condense: boolean) => {
    this.condenseView = condense
    this.refreshHabitsInView()
  }

  public setTrackerStatus = async (habitId: string, weekday: WeekdayId, emojis: string[]) => {
    if (!this.data.statuses) this.data.statuses = {}
    const existingStatus = this.data.statuses[habitId]?.[weekday]
    const newStatus = emojis.length ? emojis : undefined
    if (isEqual(existingStatus, newStatus)) {
      return existingStatus
    } else if (newStatus === undefined) {
      this.clearTrackerStatus(habitId, weekday)
      return
    }

    // 💻
    if (!this.data.statuses[habitId]) {
      this.data.statuses[habitId] = {}
      this.refreshHabitsInView() // hides condenser toggle if necessary
    }
    this.data.statuses[habitId][weekday] = newStatus

    // ☁️
    await this.dbHandler.updateWeekDoc(this.data.startDate, { statuses: this.data.statuses })

    return this.data.statuses?.[habitId]?.[weekday]
  }

  private clearTrackerStatus = async (habitId: string, weekday: WeekdayId) => {
    if (!this.data.statuses) throw new Error('No statuses to clear')

    // 💻
    delete this.data.statuses[habitId]?.[weekday]
    const noTrackerStatusesRemaining = (Object.keys(this.data.statuses[habitId]).length === 0)
    if (noTrackerStatusesRemaining) {
      delete this.data.statuses[habitId]
      this.refreshHabitsInView()
    }

    // ☁️
    await this.dbHandler.updateWeekDoc(this.data.startDate, {
      statuses: {
        [habitId]: noTrackerStatusesRemaining ? deleteField() : { [weekday]: deleteField() }
      }
    })
  }

  public setNoteLocally = (habitId: string, noteId: string, metadata: NoteMetadata) => {
    this.data.notes = this.data.notes ?? {}
    const habitNotes = this.data.notes[habitId] ?? []
    if (!habitNotes.find((existingNoteId) => noteId === existingNoteId)) {
      habitNotes.push(noteId)
      this.data.notes[habitId] = habitNotes
    }

    if (!this.data.notesMetadata) this.data.notesMetadata = {}
    this.data.notesMetadata[noteId] = metadata
  }

  public clearNoteLocally = (habitId: string, noteIdToDelete: string) => {
    if (this.data.notes?.[habitId]) {
      this.data.notes[habitId] = this.data.notes[habitId]
        .filter((noteId) => noteId !== noteIdToDelete)
      if (!this.data.notes[habitId].length) {
        delete this.data.notes[habitId]
      }
    }
    delete this.data.notesMetadata?.[noteIdToDelete]
  }

  public getNoteDataForHabit = (habitId: string) => {
    if (!this.data.notes?.[habitId]) return []
    const data = []
    for (const noteId of this.data.notes[habitId]) {
      const metadata = this.data.notesMetadata?.[noteId]
      if (!metadata) continue
      data.push({ noteId, metadata })
    }
    return data
  }

  public setFocusedTime = async (habitId: string, day: WeekdayId, time: number) => {
    if (this.data.times?.[habitId]?.[day] === time) return

    // 💻
    this.data.times = this.data.times ?? {}
    this.data.times[habitId] = this.data.times[habitId] ?? {}
    this.data.times[habitId][day] = time

    // ☁️
    await this.dbHandler.updateWeekDoc(this.data.startDate, { times: this.data.times })
  }

  public addFocusedTime = async (habitId: string, day: WeekdayId, time: number) => {
    if (time === 0) return

    // 💻
    this.data.times = this.data.times ?? {}
    this.data.times[habitId] = this.data.times[habitId] ?? {}
    this.data.times[habitId][day] = (this.data.times[habitId][day] ?? 0) + time

    // ☁️
    await this.dbHandler.updateWeekDoc(this.data.startDate, {
      times: {
        [habitId]: { [day]: increment(time) }
      }
    })
  }

  public getFocusedTime = (habitId: string, period: WeekdayId | 'week') => {
    if (period === 'week') {
      if (!this.data.times?.[habitId]) return 0
      const times = Object.values(this.data.times[habitId])
      return sum(times)
    } else {
      return this.data.times?.[habitId]?.[period] ?? 0
    }
  }

  public getNotesCount = () => {
    if (!this.data.notesMetadata || !this.data.notes) return 0
    return Object.entries(this.data.notes)
      .filter(([habitId]) => this.userHabits.find((habit) => habit.id === habitId))
      .map(([_, values]) => values)
      .flat()
      .length
  }

  private getHabitIdsWithData = () => {
    const viewDataMap: { [key in WeekViewMode]: { [key: string]: any } } = {
      tracker: this.data.statuses ?? {},
      notes: this.data.notes ?? {},
      focus: this.data.times ?? {}
    }
    return Object.keys(viewDataMap[this.weekHandler.viewMode])
      .filter((habitId) => {
        const habitData = viewDataMap[this.weekHandler.viewMode][habitId]
        return habitData.length === undefined || habitData.length > 0
      })
  }
}