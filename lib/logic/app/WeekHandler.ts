import { Lifecycle, scoped } from 'tsyringe'
import { makeAutoObservable, runInAction, toJS } from 'mobx'
import { deleteField } from '@firebase/firestore'
import { InitialState } from './InitialFetchHandler'
import { formatFirstDayOfThisWeek } from '../utils/dateUtilities'
import isEqual from 'lodash/isEqual'
import DbHandler from './DbHandler'
import HabitsHandler, { Habit } from './HabitsHandler'

export type WeekDocumentData = {
  startDate: string,
  statuses?: {
    [habitId: string]: {
      [day in WeekdayId]?: string[]
    }
  }
  journalEntries?: {
    [habitId: string]: string[]
  }
  journalMetadata?: {
    [entryId: string]: JournalEntryMetadata
  }
}

export type JournalEntryMetadata = {
  title: string,
  icon: string
}

export type WeekdayId = 0 | 1 | 2 | 3 | 4 | 5 | 6
export type WeekViewMode = 'tracker' | 'journal' | 'focus'

@scoped(Lifecycle.ContainerScoped)
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

  public viewWeek = async (startDate: string) => {
    if (startDate === this.weekInView.startDate) return
    this.isLoadingWeek = true
    this.weekInView = { startDate }
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
    const viewDataMap: { [key in WeekViewMode]: { [key: string]: any } } = {
      tracker: this.weekInView.statuses ?? {},
      journal: this.weekInView.journalEntries ?? {},
      focus: {}
    }
    const habitsWithData = Object.keys(viewDataMap[this.viewMode])
      .filter((habitId) => {
        const habitData = viewDataMap[this.viewMode][habitId]
        return habitData.length === undefined || habitData.length > 0
      })

    const habitHasData = (habit: Habit) => habitsWithData.includes(habit.id)
    this.habitsInView = this.habitsHandler.habits
      .filter((habit) => this.condenseView ? habitHasData(habit) : (habit.status === 'active' || habitHasData(habit)))

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

    return this.weekInView.statuses[habitId][weekday]
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

  public setJournalEntryLocally = (habitId: string, entryId: string, metadata: JournalEntryMetadata) => {
    this.weekInView.journalEntries = this.weekInView.journalEntries ?? {}
    const habitEntries = this.weekInView.journalEntries[habitId] ?? []
    if (!habitEntries.find((existingEntryId) => entryId === existingEntryId)) {
      habitEntries.push(entryId)
      this.weekInView.journalEntries[habitId] = habitEntries
    }

    if (!this.weekInView.journalMetadata) this.weekInView.journalMetadata = {}
    this.weekInView.journalMetadata[entryId] = metadata
  }

  public clearJournalEntryLocally = (habitId: string, entryIdToDelete: string) => {
    if (this.weekInView.journalEntries?.[habitId]) {
      this.weekInView.journalEntries[habitId] = this.weekInView.journalEntries[habitId]
        .filter((entryId) => entryId !== entryIdToDelete)
      if (!this.weekInView.journalEntries[habitId].length) {
        delete this.weekInView.journalEntries[habitId]
      }
    }
    delete this.weekInView.journalMetadata?.[entryIdToDelete]
  }

  public getJournalEntryDataForHabit = (habitId: string) => {
    if (!this.weekInView.journalEntries?.[habitId]) return []
    const data = []
    for (const entryId of this.weekInView.journalEntries[habitId]) {
      const metadata = this.weekInView.journalMetadata?.[entryId]
      if (!metadata) continue
      data.push({ entryId, metadata })
    }
    return data
  }
}