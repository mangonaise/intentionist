import { singleton } from 'tsyringe'
import { makeAutoObservable } from 'mobx'
import { deleteField, increment } from '@firebase/firestore'
import { Habit } from '@/logic/app/HabitsHandler'
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

export type NoteMetadata = { title: string, icon: string }
export type WeekdayId = 0 | 1 | 2 | 3 | 4 | 5 | 6
export type WeekViewMode = 'tracker' | 'notes' | 'focus'

interface WeekInitParams {
  weekData: WeekDocumentData,
  userHabits: Habit[]
  friendUid?: string,
  isCondensable: boolean
}

@singleton()
export default class WeekInView {
  public weekData: WeekDocumentData = { startDate: '0000-01-01' }
  public userHabits: Habit[] = []
  public habitsInView: Habit[] = []
  public friendUid?: string
  public viewMode: WeekViewMode = 'tracker'
  public condenseView: boolean = false
  public showCondenseViewToggle = false
  public isLoadingWeek = true
  private isCondensable = false

  constructor(private dbHandler: DbHandler) {
    makeAutoObservable(this)
  }

  public setWeek({ weekData, userHabits, friendUid, isCondensable }: WeekInitParams) {
    this.isLoadingWeek = false
    this.friendUid = friendUid
    this.weekData = weekData
    this.isCondensable = isCondensable
    this.condenseView = isCondensable && userHabits.some((habit) => habit.status === 'active')

    this.refreshHabitsInView(userHabits)
  }

  public setLoadingState = (startDate: string, friendUid?: string, cachedIcon?: string) => {
    this.isLoadingWeek = true
    this.weekData = { startDate, icon: cachedIcon }
    this.friendUid = friendUid
  }

  public setViewMode = (viewMode: WeekViewMode) => {
    this.viewMode = viewMode
    this.refreshHabitsInView()
  }

  public refreshWeekData = (newData: WeekDocumentData) => {
    this.weekData = newData
  }

  public refreshHabitsInView = (newHabits?: Habit[]) => {
    this.userHabits = newHabits ?? this.userHabits

    const habitIdsWithData = this.getHabitIdsWithData()
    const habitHasData = (habit: Habit) => habitIdsWithData.includes(habit.id)
    
    this.habitsInView = this.userHabits
      .filter((habit) => this.condenseView
        ? habitHasData(habit)
        : (habit.status === 'active' || habitHasData(habit)))

    if (this.viewMode === 'focus') {
      this.habitsInView = this.habitsInView.filter((habit) => habit.timeable)
    }

    const activeHabits = this.userHabits.filter((habit) => habit.status === 'active')
    const doAllActiveHabitsHaveData = activeHabits.every(habitHasData)
    this.showCondenseViewToggle = this.isCondensable && !doAllActiveHabitsHaveData

    return this.habitsInView
  }

  public setCondensedView = (condense: boolean) => {
    this.condenseView = condense
    this.refreshHabitsInView()
  }

  public setTrackerStatus = async (habitId: string, weekday: WeekdayId, emojis: string[]) => {
    if (!this.weekData.statuses) this.weekData.statuses = {}
    const existingStatus = this.weekData.statuses[habitId]?.[weekday]
    const newStatus = emojis.length ? emojis : undefined
    if (isEqual(existingStatus, newStatus)) {
      return existingStatus
    } else if (newStatus === undefined) {
      this.clearTrackerStatus(habitId, weekday)
      return
    }

    // 💻
    if (!this.weekData.statuses[habitId]) {
      this.weekData.statuses[habitId] = {}
      this.refreshHabitsInView() // hides condenser toggle if necessary
    }
    this.weekData.statuses[habitId][weekday] = newStatus

    // ☁️
    await this.dbHandler.updateWeekDoc(this.weekData.startDate, { statuses: this.weekData.statuses })

    return this.weekData.statuses?.[habitId]?.[weekday]
  }

  private clearTrackerStatus = async (habitId: string, weekday: WeekdayId) => {
    if (!this.weekData.statuses) throw new Error('No statuses to clear')

    // 💻
    delete this.weekData.statuses[habitId]?.[weekday]
    const noTrackerStatusesRemaining = (Object.keys(this.weekData.statuses[habitId]).length === 0)
    if (noTrackerStatusesRemaining) {
      delete this.weekData.statuses[habitId]
      this.refreshHabitsInView()
    }

    // ☁️
    await this.dbHandler.updateWeekDoc(this.weekData.startDate, {
      statuses: {
        [habitId]: noTrackerStatusesRemaining ? deleteField() : { [weekday]: deleteField() }
      }
    })
  }

  public setNoteLocally = (habitId: string, noteId: string, metadata: NoteMetadata) => {
    this.weekData.notes = this.weekData.notes ?? {}
    const habitNotes = this.weekData.notes[habitId] ?? []
    if (!habitNotes.find((existingNoteId) => noteId === existingNoteId)) {
      habitNotes.push(noteId)
      this.weekData.notes[habitId] = habitNotes
    }

    if (!this.weekData.notesMetadata) this.weekData.notesMetadata = {}
    this.weekData.notesMetadata[noteId] = metadata
  }

  public clearNoteLocally = (habitId: string, noteIdToDelete: string) => {
    if (this.weekData.notes?.[habitId]) {
      this.weekData.notes[habitId] = this.weekData.notes[habitId]
        .filter((noteId) => noteId !== noteIdToDelete)
      if (!this.weekData.notes[habitId].length) {
        delete this.weekData.notes[habitId]
      }
    }
    delete this.weekData.notesMetadata?.[noteIdToDelete]
  }

  public getNoteDataForHabit = (habitId: string) => {
    if (!this.weekData.notes?.[habitId]) return []
    const data = []
    for (const noteId of this.weekData.notes[habitId]) {
      const metadata = this.weekData.notesMetadata?.[noteId]
      if (!metadata) continue
      data.push({ noteId, metadata })
    }
    return data
  }

  public setFocusedTime = async (habitId: string, day: WeekdayId, time: number) => {
    if (this.weekData.times?.[habitId]?.[day] === time) return

    // 💻
    this.weekData.times = this.weekData.times ?? {}
    this.weekData.times[habitId] = this.weekData.times[habitId] ?? {}
    this.weekData.times[habitId][day] = time

    // ☁️
    await this.dbHandler.updateWeekDoc(this.weekData.startDate, { times: this.weekData.times })
  }

  public addFocusedTime = async (habitId: string, day: WeekdayId, time: number) => {
    if (time === 0) return

    // 💻
    this.weekData.times = this.weekData.times ?? {}
    this.weekData.times[habitId] = this.weekData.times[habitId] ?? {}
    this.weekData.times[habitId][day] = (this.weekData.times[habitId][day] ?? 0) + time

    // ☁️
    await this.dbHandler.updateWeekDoc(this.weekData.startDate, {
      times: {
        [habitId]: { [day]: increment(time) }
      }
    })
  }

  public getFocusedTime = (habitId: string, period: WeekdayId | 'week') => {
    if (period === 'week') {
      if (!this.weekData.times?.[habitId]) return 0
      const times = Object.values(this.weekData.times[habitId])
      return sum(times)
    } else {
      return this.weekData.times?.[habitId]?.[period] ?? 0
    }
  }

  public getNotesCount = () => {
    if (!this.weekData.notesMetadata || !this.weekData.notes) return 0
    return Object.entries(this.weekData.notes)
      .filter(([habitId]) => this.userHabits.find((habit) => habit.id === habitId))
      .map(([_, values]) => values)
      .flat()
      .length
  }

  private getHabitIdsWithData = () => {
    const viewDataMap: { [key in WeekViewMode]: { [key: string]: any } } = {
      tracker: this.weekData.statuses ?? {},
      notes: this.weekData.notes ?? {},
      focus: this.weekData.times ?? {}
    }
    return Object.keys(viewDataMap[this.viewMode])
      .filter((habitId) => {
        const habitData = viewDataMap[this.viewMode][habitId]
        const arrayLength = habitData.length
        if (arrayLength !== undefined) return arrayLength > 0
        return true
      })
  }
}