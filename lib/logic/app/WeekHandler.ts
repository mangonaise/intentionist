import { Lifecycle, scoped } from 'tsyringe'
import { makeAutoObservable, runInAction } from 'mobx'
import { deleteField } from '@firebase/firestore'
import { InitialState } from './InitialFetchHandler'
import { formatFirstDayOfThisWeek } from '../utils/dateUtilities'
import isEqual from 'lodash/isEqual'
import DbHandler from './DbHandler'
import HabitsHandler, { Habit } from './HabitsHandler'

export type WeekDocumentData = {
  startDate: string,
  statuses: HabitTrackerStatuses
}

export type WeekdayId = 0 | 1 | 2 | 3 | 4 | 5 | 6
export type WeekViewMode = 'tracker' | 'journal' | 'focus'
export type HabitTrackerStatuses = { [habitId: string]: { [day in WeekdayId]?: string[] } }

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
    this.weekInView = initialAppState.data.latestWeekDoc ?? this.generateEmptyWeek(thisWeekStartDate)
    this.habitsInView = this.refreshHabitsInView()
    makeAutoObservable(this)
  }

  public setViewMode = (viewMode: WeekViewMode) => {
    this.viewMode = viewMode
    // TODO: When different modes are implemented, test that correct habits are in view and that condense toggle visibility is correctly set
  }

  public viewWeek = async (startDate: string) => {
    this.isLoadingWeek = true
    this.weekInView.startDate = startDate
    const weekDoc = await this.dbHandler.getWeekDoc(startDate)
    runInAction(() => {
      this.weekInView = weekDoc ?? this.generateEmptyWeek(startDate)
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
    // TODO: When different modes are implemented, change viewData based on the current view mode
    const viewData = this.weekInView.statuses ?? {}
    const habitsWithData = Object.keys(viewData)
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

  private generateEmptyWeek = (startDate: string): WeekDocumentData => {
    if (new Date(startDate) > new Date(this.latestWeekStartDate)) {
      this.latestWeekStartDate = startDate
    }

    return {
      startDate,
      statuses: {}
    }
  }
}