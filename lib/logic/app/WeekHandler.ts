import { singleton } from 'tsyringe'
import { makeAutoObservable, runInAction, when } from 'mobx'
import { deleteField, increment } from '@firebase/firestore'
import { InitialState } from '@/logic/app/InitialFetchHandler'
import { formatFirstDayOfThisWeek } from '@/logic/utils/dateUtilities'
import HabitsHandler, { Habit } from '@/logic/app/HabitsHandler'
import DbHandler from '@/logic/app/DbHandler'
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
  public weekInView: WeekDocumentData
  public habitsInView: Habit[]
  public condenseView = false
  public showCondenseViewToggle = false
  public isLoadingWeek = false
  public latestWeekStartDate: string
  private dbHandler
  private habitsHandler

  constructor(initialAppState: InitialState, dbHandler: DbHandler, habitsHandler: HabitsHandler) {
    const thisWeekStartDate = formatFirstDayOfThisWeek()
    this.dbHandler = dbHandler
    this.habitsHandler = habitsHandler
    this.latestWeekStartDate = initialAppState.data.latestWeekDoc?.startDate ?? thisWeekStartDate
    this.weekInView = initialAppState.data.latestWeekDoc ?? { startDate: thisWeekStartDate }
    this.habitsInView = this.refreshHabitsInView()
    makeAutoObservable(this)
  }

  public setViewMode = (viewMode: WeekViewMode) => {
    this.viewMode = viewMode
    this.refreshHabitsInView()
  }

  public viewWeek = async (startDate: string, cachedIcon?: string) => {
    if (startDate === this.weekInView.startDate) return
    this.isLoadingWeek = true
    this.weekInView = { startDate }
    if (cachedIcon) this.weekInView.icon = cachedIcon
    await when(() => this.dbHandler.isWriteComplete)
    const weekDoc = await this.dbHandler.getWeekDoc(startDate)
    runInAction(() => {
      if (new Date(startDate) > new Date(this.latestWeekStartDate)) {
        this.latestWeekStartDate = startDate
        this.dbHandler.updateWeekDoc(startDate, {})
      }
      this.weekInView = weekDoc ?? { startDate }
      this.condenseView =
        startDate !== this.latestWeekStartDate
        && this.habitsHandler.habits.filter((habit) => habit.status === 'active').length > 0
      this.isLoadingWeek = false
    })
    this.refreshHabitsInView()
  }

  public setCondensedView = (condense: boolean) => {
    this.condenseView = condense
    this.refreshHabitsInView()
  }

  public refreshHabitsInView = () => {
    const habitHasData = (habit: Habit) => this.getHabitIdsWithData().includes(habit.id)
    this.habitsInView = this.habitsHandler.habits
      .filter((habit) => this.condenseView ? habitHasData(habit) : (habit.status === 'active' || habitHasData(habit)))

    if (this.viewMode === 'focus') {
      this.habitsInView = this.habitsInView.filter((habit) => habit.timeable)
    }

    const isPastWeek = this.weekInView.startDate !== this.latestWeekStartDate
    const activeHabits = this.habitsHandler.habits.filter((habit) => habit.status === 'active')
    const doAllActiveHabitsHaveData = activeHabits.every(habitHasData)
    this.showCondenseViewToggle = isPastWeek && !doAllActiveHabitsHaveData

    return this.habitsInView
  }

  public setTrackerStatus = async (habitId: string, weekday: WeekdayId, emojis: string[]) => {
    if (!this.weekInView.statuses) this.weekInView.statuses = {}
    const existingStatus = this.weekInView.statuses[habitId]?.[weekday]
    const newStatus = emojis.length ? emojis : undefined
    if (isEqual(existingStatus, newStatus)) {
      return existingStatus
    } else if (newStatus === undefined) {
      this.clearTrackerStatus(habitId, weekday)
      return
    }

    // 💻
    if (!this.weekInView.statuses[habitId]) {
      this.weekInView.statuses[habitId] = {}
      this.refreshHabitsInView()
    }
    this.weekInView.statuses[habitId][weekday] = newStatus

    // ☁️
    await this.dbHandler.updateWeekDoc(this.weekInView.startDate, { statuses: this.weekInView.statuses })

    return this.weekInView.statuses?.[habitId]?.[weekday]
  }

  private clearTrackerStatus = async (habitId: string, weekday: WeekdayId) => {
    if (!this.weekInView.statuses) throw new Error('No statuses to clear')

    // 💻
    delete this.weekInView.statuses[habitId][weekday]
    const noTrackerStatusesRemaining = (Object.keys(this.weekInView.statuses[habitId]).length === 0)
    if (noTrackerStatusesRemaining) {
      delete this.weekInView.statuses[habitId]
      this.refreshHabitsInView()
    }

    // ☁️
    await this.dbHandler.updateWeekDoc(this.weekInView.startDate, {
      statuses: {
        [habitId]: noTrackerStatusesRemaining ? deleteField() : { [weekday]: deleteField() }
      }
    })
  }

  public setNoteLocally = (habitId: string, noteId: string, metadata: NoteMetadata) => {
    this.weekInView.notes = this.weekInView.notes ?? {}
    const habitNotes = this.weekInView.notes[habitId] ?? []
    if (!habitNotes.find((existingNoteId) => noteId === existingNoteId)) {
      habitNotes.push(noteId)
      this.weekInView.notes[habitId] = habitNotes
    }

    if (!this.weekInView.notesMetadata) this.weekInView.notesMetadata = {}
    this.weekInView.notesMetadata[noteId] = metadata
  }

  public clearNoteLocally = (habitId: string, noteIdToDelete: string) => {
    if (this.weekInView.notes?.[habitId]) {
      this.weekInView.notes[habitId] = this.weekInView.notes[habitId]
        .filter((noteId) => noteId !== noteIdToDelete)
      if (!this.weekInView.notes[habitId].length) {
        delete this.weekInView.notes[habitId]
      }
    }
    delete this.weekInView.notesMetadata?.[noteIdToDelete]
  }

  public getNoteDataForHabit = (habitId: string) => {
    if (!this.weekInView.notes?.[habitId]) return []
    const data = []
    for (const noteId of this.weekInView.notes[habitId]) {
      const metadata = this.weekInView.notesMetadata?.[noteId]
      if (!metadata) continue
      data.push({ noteId, metadata })
    }
    return data
  }

  public setFocusedTime = async (habitId: string, day: WeekdayId, time: number) => {
    if (this.weekInView.times?.[habitId]?.[day] === time) return

    // 💻
    this.weekInView.times = this.weekInView.times ?? {}
    this.weekInView.times[habitId] = this.weekInView.times[habitId] ?? {}
    this.weekInView.times[habitId][day] = time

    // ☁️
    await this.dbHandler.updateWeekDoc(this.weekInView.startDate, { times: this.weekInView.times })
  }

  public addFocusedTime = async (habitId: string, day: WeekdayId, time: number) => {
    if (time === 0) return

    // 💻
    this.weekInView.times = this.weekInView.times ?? {}
    this.weekInView.times[habitId] = this.weekInView.times[habitId] ?? {}
    this.weekInView.times[habitId][day] = (this.weekInView.times[habitId][day] ?? 0) + time

    // ☁️
    await this.dbHandler.updateWeekDoc(this.weekInView.startDate, {
      times: {
        [habitId]: { [day]: increment(time) }
      }
    })
  }

  public getFocusedTime = (habitId: string, period: WeekdayId | 'week') => {
    if (period === 'week') {
      if (!this.weekInView.times?.[habitId]) return 0
      const times = Object.values(this.weekInView.times[habitId])
      return sum(times)
    } else {
      return this.weekInView.times?.[habitId]?.[period] ?? 0
    }
  }

  public getNotesCount = (weekInView: WeekDocumentData) => {
    if (!weekInView.notesMetadata || !weekInView.notes) return 0
    return Object.entries(weekInView.notes)
      .filter(([habitId]) => this.habitsHandler.habits.find((habit) => habit.id === habitId))
      .map(([_, values]) => values)
      .flat()
      .length
  }

  private getHabitIdsWithData = () => {
    const viewDataMap: { [key in WeekViewMode]: { [key: string]: any } } = {
      tracker: this.weekInView.statuses ?? {},
      notes: this.weekInView.notes ?? {},
      focus: this.weekInView.times ?? {}
    }
    return Object.keys(viewDataMap[this.viewMode])
      .filter((habitId) => {
        const habitData = viewDataMap[this.viewMode][habitId]
        return habitData.length === undefined || habitData.length > 0
      })
  }
}