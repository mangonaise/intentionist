import { makeAutoObservable } from 'mobx'
import { singleton } from 'tsyringe'
import { deleteField } from '@firebase/firestore'
import { Habit } from '@/logic/app/HabitsHandler'
import DbHandler from '@/logic/app/DbHandler'
import dateFnsGetDaysInYear from 'date-fns/getDaysInYear'

//* the first day of the year is represented as 1, NOT 0.

export type YearAndDay = {
  year: number,
  dayOfYear: number
}

@singleton()
export default class HabitStatusesHandler {
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

      const value = this.getHabitStatusAtDate(habit, date)
      const hasPreviousValue = !!this.getHabitStatusAtDate(habit, previousDate)
      const hasNextValue = !!this.getHabitStatusAtDate(habit, nextDate)

      result.push({ value, date, hasPreviousValue, hasNextValue })

      date = nextDate
    }

    return result
  }

  public setHabitStatus = async (habit: Habit, date: YearAndDay, newStatus: string | null) => {
    const { year, dayOfYear } = date

    const existingStatus = this.getHabitStatusAtDate(habit, date)
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

    // ☁️
    await this.dbHandler.update(this.dbHandler.habitDocRef(habit.id), {
      statuses: {
        [year]: isYearEmpty ? deleteField() : { [dayOfYear]: deleteField() }
      }
    })
  }

  private getDaysInYear = (year: number) => {
    const cachedCount = this.daysInYearCounts[year]

    if (cachedCount) {
      return cachedCount
    }

    return this.daysInYearCounts[year] = dateFnsGetDaysInYear(new Date(`${year}`))
  }

  private getHabitStatusAtDate = (habit: Habit, date: YearAndDay) => {
    return habit.statuses?.[date.year]?.[date.dayOfYear] ?? null
  }

  private getPreviousDate = (date: YearAndDay): YearAndDay => {
    let year = date.year
    let dayOfYear = date.dayOfYear - 1

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