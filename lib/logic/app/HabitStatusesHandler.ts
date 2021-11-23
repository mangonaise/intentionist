import { makeAutoObservable } from 'mobx'
import { singleton } from 'tsyringe'
import { deleteField } from '@firebase/firestore'
import { Habit, HabitStatuses } from '@/logic/app/HabitsHandler'
import DbHandler from '@/logic/app/DbHandler'
import getYearAndDay from '@/logic/utils/getYearAndDay'
import dateFnsGetDaysInYear from 'date-fns/getDaysInYear'
import startOfWeek from 'date-fns/startOfWeek'

//* the first day of the year is represented as 1, NOT 0.

export type YearAndDay = {
  year: number,
  dayOfYear: number
}

type Streak = { count: number, isPending: boolean }

@singleton()
export default class HabitStatusesHandler {
  public streaks: { [habitId: string]: Streak } = {}
  private daysInYearCounts: { [year: number]: number } = {}

  constructor(private dbHandler: DbHandler) {
    makeAutoObservable(this)
  }

  public getWeeklyHabitStatusData = (habit: Habit, weekStart: YearAndDay) => {
    let date = weekStart
    let result = [] as Array<{ value: string | null, date: YearAndDay, hasPreviousValue: boolean, hasNextValue: boolean }>

    for (let i = 0; i < 7; i++) {
      const previousDate = this.getPreviousDate(date)
      const nextDate = this.getNextDate(date)

      const value = this.getHabitStatusAtDate(habit.statuses, date)
      const hasPreviousValue = !!this.getHabitStatusAtDate(habit.statuses, previousDate)
      const hasNextValue = !!this.getHabitStatusAtDate(habit.statuses, nextDate)

      result.push({ value, date, hasPreviousValue, hasNextValue })

      date = nextDate
    }

    return result
  }

  public setHabitStatus = async (habit: Habit, date: YearAndDay, newStatus: string | null) => {
    const { year, dayOfYear } = date

    const existingStatus = this.getHabitStatusAtDate(habit.statuses, date)
    if (existingStatus === newStatus) {
      return existingStatus
    } else if (newStatus === null) {
      this.clearHabitStatus(habit, date)
      return
    }

    if (!habit.statuses) habit.statuses = {}

    // 💻
    if (!habit.statuses[year]) habit.statuses[year] = {}
    habit.statuses[year][dayOfYear] = newStatus
    this.refreshStreak(habit)

    // ☁️
    await this.dbHandler.update(this.dbHandler.habitDocRef(habit.id), { statuses: habit.statuses })

    return habit.statuses[year][dayOfYear]
  }

  private clearHabitStatus = async (habit: Habit, date: YearAndDay) => {
    const { year, dayOfYear } = date
    if (!habit.statuses?.[year]?.[dayOfYear]) return

    // 💻
    delete habit.statuses[year][dayOfYear]
    const isYearEmpty = (Object.keys(habit.statuses[year]).length === 0)
    if (isYearEmpty) delete habit.statuses[year]
    this.refreshStreak(habit)

    // ☁️
    await this.dbHandler.update(this.dbHandler.habitDocRef(habit.id), {
      statuses: {
        [year]: isYearEmpty ? deleteField() : { [dayOfYear]: deleteField() }
      }
    })
  }

  public refreshStreak = (habit: Habit) => {
    let streak: Streak

    if (!habit.statuses || !habit.weeklyFrequency) {
      streak = { count: 0, isPending: true }
    } else {
      streak = habit.weeklyFrequency === 7 ?
        this.calculateDailyStreak(habit.statuses)
        : this.calculateWeeklyStreak(habit.statuses, habit.weeklyFrequency)
    }

    this.streaks[habit.id] = streak
  }

  private calculateDailyStreak = (statuses: HabitStatuses): Streak => {
    const today = getYearAndDay(new Date())

    const hasValueToday = !!statuses[today.year]?.[today.dayOfYear]
    const isPending = !hasValueToday
    let count = hasValueToday ? 1 : 0

    let dateToCount = this.getPreviousDate(today)

    while (this.getHabitStatusAtDate(statuses, dateToCount)) {
      count++
      dateToCount = this.getPreviousDate(dateToCount)
    }

    return { count, isPending }
  }

  private calculateWeeklyStreak = (statuses: HabitStatuses, frequency: number): Streak => {
    const hasEnoughStatusesInWeek = (weekStart: YearAndDay) => {
      let dateToCount = weekStart
      let statusesInWeek = 0

      for (let i = 0; i < 7; i++) {
        if (this.getHabitStatusAtDate(statuses, dateToCount)) {
          statusesInWeek++
          if (statusesInWeek >= frequency) {
            return true
          }
        }
        dateToCount = this.getNextDate(dateToCount)
      }

      return false
    }

    const thisWeekStart = getYearAndDay(startOfWeek(new Date(), { weekStartsOn: 1 }))
    const hasEnoughStatusesThisWeek = hasEnoughStatusesInWeek(thisWeekStart)
    const isPending = !hasEnoughStatusesThisWeek
    let count = hasEnoughStatusesThisWeek ? 1 : 0

    let weekToCount = this.getPreviousDate(thisWeekStart, { subtractWeek: true })

    while (hasEnoughStatusesInWeek(weekToCount)) {
      count++
      weekToCount = this.getPreviousDate(weekToCount, { subtractWeek: true })
    }

    return { count, isPending }
  }

  private getDaysInYear = (year: number) => {
    const cachedCount = this.daysInYearCounts[year]

    if (cachedCount) {
      return cachedCount
    }

    return this.daysInYearCounts[year] = dateFnsGetDaysInYear(new Date(`${year}`))
  }

  private getHabitStatusAtDate = (statuses: HabitStatuses | undefined, date: YearAndDay) => {
    return statuses?.[date.year]?.[date.dayOfYear] ?? null
  }

  private getPreviousDate = (date: YearAndDay, options?: { subtractWeek: boolean }): YearAndDay => {
    let year = date.year
    let dayOfYear = date.dayOfYear - (options?.subtractWeek ? 7 : 1)

    if (dayOfYear < 1) {
      year -= 1
      dayOfYear = this.getDaysInYear(year)
    }

    return {
      year,
      dayOfYear
    }
  }

  private getNextDate = (date: YearAndDay): YearAndDay => {
    let year = date.year
    let dayOfYear = date.dayOfYear + 1

    if (dayOfYear > this.getDaysInYear(date.year)) {
      year += 1
      dayOfYear = 1
    }

    return {
      year,
      dayOfYear
    }
  }
}