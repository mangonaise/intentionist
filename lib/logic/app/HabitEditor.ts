import { makeAutoObservable } from 'mobx'
import { inject, injectable } from 'tsyringe'
import Router from '../types/router'
import generateHabitId from '../utils/generateHabitId'
import HabitsHandler, { Habit } from './HabitsHandler'

type QueryParams = {
  id: string | undefined
}

@injectable()
export default class HabitEditor {
  public habit
  public isNewHabit
  private habitsHandler
  private router

  constructor(habitsHandler: HabitsHandler, @inject('Router') router: Router) {
    if (!habitsHandler.hasFetchedHabits) {
      throw new Error('Cannot edit habit before habits have been fetched')
    }
    this.habitsHandler = habitsHandler
    this.router = router

    const query = router.query as QueryParams
    if (query?.id === 'new') {
      this.isNewHabit = true
      this.habit = this.generateEmptyHabit()
    } else {
      this.isNewHabit = false
      const existingHabit = habitsHandler.habits.find(habit => habit.id === query.id)
      if (existingHabit) {
        this.habit = existingHabit
      } else {
        router.push('/habits')
        return
      }
    }

    makeAutoObservable(this)
  }

  public updateHabit = (habit: Habit) => {
    this.habit = habit
  }

  public saveAndExit = () => {
    if (!this.habit) throw new Error('Cannot save undefined habit')
    this.habitsHandler.setHabit(this.habit)
    this.exit()
  }

  public exit = () => {
    this.router.push('/habits')
  }

  private generateEmptyHabit = () => {
    return {
      id: generateHabitId(),
      name: '',
      icon: '🙂',
      status: 'active'
    } as Habit
  }
}