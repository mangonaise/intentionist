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
  public isLoadingWeek = false
  private latestWeekInDb
  private dbHandler
  private habitsHandler

  constructor(initialAppState: InitialState, dbHandler: DbHandler, habitsHandler: HabitsHandler) {
    this.dbHandler = dbHandler
    this.habitsHandler = habitsHandler
    this.latestWeekInDb = initialAppState.data.latestWeekDoc
    this.weekInView = this.latestWeekInDb ?? this.generateEmptyWeek(formatFirstDayOfThisWeek())
    this.habitsInView = this.determineHabitsInView()
    makeAutoObservable(this)
  }

  public setViewMode = (viewMode: WeekViewMode) => {
    this.viewMode = viewMode
  }

  public viewWeek = async (startDate: string) => {
    this.isLoadingWeek = true
    this.weekInView.startDate = startDate
    const weekDoc = await this.dbHandler.getWeekDoc(startDate)
    runInAction(() => {
      this.weekInView = weekDoc ?? this.generateEmptyWeek(startDate)
      this.isLoadingWeek = false
    })
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
    this.weekInView.statuses[habitId] = this.weekInView.statuses[habitId] ?? {}
    this.weekInView.statuses[habitId][weekday] = newStatus

    // ☁️
    await this.dbHandler.updateWeekDoc(this.weekInView.startDate, { statuses: this.weekInView.statuses })

    return this.weekInView.statuses[habitId][weekday]
  }

  private clearTrackerStatus = async (habitId: string, weekday: WeekdayId) => {
    // 💻
    delete this.weekInView.statuses[habitId][weekday]
    const noTrackerStatusesRemaining = (Object.keys(this.weekInView.statuses[habitId]).length === 0)
    if (noTrackerStatusesRemaining) delete this.weekInView.statuses[habitId]

    // ☁️
    await this.dbHandler.updateWeekDoc(this.weekInView.startDate, {
      statuses: {
        [habitId]: noTrackerStatusesRemaining ? deleteField() : { [weekday]: deleteField() }
      }
    })
  }

  private determineHabitsInView() {
    // TODO: Determine habits to display based on habit statuses + week data
    return this.habitsHandler.habits
  }

  private generateEmptyWeek(startDate: string): WeekDocumentData {
    return {
      startDate,
      statuses: {}
    }
  }
}