import { makeAutoObservable } from 'mobx'
import { inject, injectable } from 'tsyringe'
import HabitsHandler, { Habit } from '@/logic/app/HabitsHandler'
import generateHabitId from '@/logic/utils/generateHabitId'
import Router from '@/types/router'

type QueryParams = {
  id: string | undefined,
  new: any,
  returnHome: boolean | undefined
}

@injectable()
export default class HabitEditor {
  public habit
  public isNewHabit
  private habitsHandler
  private router
  private returnHomeOnExit

  constructor(habitsHandler: HabitsHandler, @inject('Router') router: Router) {
    this.habitsHandler = habitsHandler
    this.router = router

    const query = router.query as QueryParams
    this.returnHomeOnExit = query?.returnHome
    if (query.new !== undefined) {
      this.isNewHabit = true
      this.habit = this.generateEmptyHabit()
    } else {
      this.isNewHabit = false
      const existingHabit = query.id ? habitsHandler.findHabitById(query.id) : null
      if (existingHabit) {
        this.habit = existingHabit
      } else {
        router.push('/habits')
        return
      }
    }

    makeAutoObservable(this)
  }

  public updateHabit = (updates: Partial<Habit>) => {
    if (!this.habit) throw new Error('Cannot update undefined habit')
    this.habit = { ...this.habit, ...updates }
  }

  public deleteHabit = () => {
    if (!this.habit) throw new Error('Cannot delete undefined habit')
    this.habitsHandler.deleteHabitById(this.habit.id)
    this.exit()
  }

  public saveAndExit = () => {
    if (!this.habit) throw new Error('Cannot save undefined habit')
    this.habitsHandler.setHabit(this.habit)
    this.exit()
  }

  public exit = () => {
    this.router.push(this.returnHomeOnExit ? '/home' : '/habits')
  }

  private generateEmptyHabit = () => {
    console.warn('generateEmptyHabit not implemented')
  }
}