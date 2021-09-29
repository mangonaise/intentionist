import { arrayUnion, arrayRemove, deleteField } from '@firebase/firestore'
import { makeAutoObservable } from 'mobx'
import { singleton } from 'tsyringe'
import omit from 'lodash/omit'
import isEqual from 'lodash/isEqual'
import DbHandler from './DbHandler'

type HabitsDocumentData = {
  habits: { [id: string]: HabitProperties },
  order: string[]
}
export type HabitStatus = 'active' | 'suspended' | 'archived'
export type Habit = { id: string } & HabitProperties
export type HabitProperties = {
  name: string
  icon: string
  status: HabitStatus
}

@singleton()
export default class HabitsHandler {
  public habits: Habit[] = []
  public hasFetchedHabits = false
  private dbHandler

  constructor(dbHandler: DbHandler) {
    this.dbHandler = dbHandler
    makeAutoObservable(this)
  }

  public fetchHabits = async () => {
    if (this.hasFetchedHabits) return this.habits
    const habitsDoc = await this.dbHandler.getUserDoc('data', 'habits')
    this.handleFetchedHabitsDoc(habitsDoc as HabitsDocumentData | undefined)
  }

  public setHabit = async (habitToSet: Habit) => {
    let existingHabit = this.habits.find(habit => habit.id === habitToSet.id)
    if (!existingHabit) {
      return await this.addNewHabit(habitToSet)
    }
    if (isEqual(existingHabit, habitToSet)) return
    
    // 💻
    const index = this.habits.indexOf(existingHabit)
    this.habits[index] = habitToSet

    // ☁️
    await this.dbHandler.updateUserDoc('data/habits', {
      habits: { [habitToSet.id]: { ...omit(habitToSet, 'id') } }
    })
    
    return this.habits[index]
  }
  
  public deleteHabitById = async (id: string) => {
    const habitToDelete = this.habits.find(habit => habit.id === id)
    if (!habitToDelete) throw new Error('Cannot delete a habit that does not exist')
    
    // 💻
    this.habits = this.habits.filter(habit => habit !== habitToDelete)

    // ☁️
    await this.dbHandler.updateUserDoc('data/habits', {
      habits: { [habitToDelete.id]: deleteField() },
      order: arrayRemove(habitToDelete.id)
    })
  }
  
  private addNewHabit = async (newHabit: Habit) => {
    // 💻
    this.habits.push(newHabit)
  
    // ☁️
    await this.dbHandler.updateUserDoc('data/habits', {
      habits: { [newHabit.id]: { ...omit(newHabit, 'id') } },
      order: arrayUnion(newHabit.id)
    })

    return newHabit
  }

  private handleFetchedHabitsDoc(docData: HabitsDocumentData | undefined) {
    this.hasFetchedHabits = true
    if (!docData) return
    this.habits = docData.order.map(id => ({
      id,
      ...docData.habits[id]
    }))
  }
}