import { injectable } from 'tsyringe'
import { makeAutoObservable } from 'mobx'
import HabitsHandler, { Habit, HabitStatus } from './HabitsHandler'

@injectable()
export default class HabitFilterHandler {
  public filteredHabits: Habit[]
  public filter: HabitStatus = 'active'
  private habitsHandler

  constructor(habitsHandler: HabitsHandler) {
    this.habitsHandler = habitsHandler
    this.filteredHabits = this.getFilteredHabits(this.filter)
    makeAutoObservable(this) 
  }

  public setFilter = (filter: HabitStatus) => { 
    this.filter = filter
    this.filteredHabits = this.getFilteredHabits(filter)
  }

  private getFilteredHabits = (filter: HabitStatus) => {
    return this.habitsHandler.habits.filter(habit => habit.status === filter)
  }
}