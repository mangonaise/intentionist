import { arrayUnion } from '@firebase/firestore'
import { makeAutoObservable } from 'mobx'
import { Lifecycle, scoped } from 'tsyringe'
import { Fetched, InitialState } from './InitialFetchHandler'
import isEqual from 'lodash/isEqual'
import exclude from '../utils/exclude'
import DbHandler, { HABITS } from './DbHandler'
import arrayMove from '../utils/arrayMove'

export type HabitsDocumentData = {
  habits: { [id: string]: HabitProperties },
  order: string[]
}

export type HabitStatus = 'active' | 'suspended' | 'archived'
export type Habit = { id: string } & HabitProperties
export type HabitProperties = {
  name: string
  icon: string
  status: HabitStatus,
  palette?: string[]
}

@scoped(Lifecycle.ContainerScoped)
export default class HabitsHandler {
  public habits: Habit[]
  private dbHandler

  constructor(initialState: InitialState, dbHandler: DbHandler) {
    this.habits = this.processFetchedHabits(initialState.data.habitsDoc)
    this.dbHandler = dbHandler
    makeAutoObservable(this)
  }

  public setHabit = async (habitToSet: Habit) => {
    let existingHabit = this.habits.find(habit => habit.id === habitToSet.id)
    if (!existingHabit) {
      return await this.addNewHabit(habitToSet)
    }
    if (isEqual(existingHabit, habitToSet)) return existingHabit

    // 💻
    const index = this.habits.indexOf(existingHabit)
    this.habits[index] = habitToSet

    // ☁️
    await this.dbHandler.updateUserDoc(HABITS, {
      habits: { [habitToSet.id]: { ...exclude(habitToSet, 'id') } }
    })

    return this.habits[index]
  }

  public deleteHabitById = async (id: string) => {
    const habitToDelete = this.habits.find(habit => habit.id === id)
    if (!habitToDelete) throw new Error('Cannot delete a habit that does not exist')

    // 💻
    this.habits = this.habits.filter(habit => habit !== habitToDelete)

    // ☁️
    await this.dbHandler.deleteHabit(id)
  }

  public reorderHabits = async (habitToMove: Habit, habitToTakePositionOf: Habit) => {
    const oldIndex = this.habits.indexOf(habitToMove)
    const newIndex = this.habits.indexOf(habitToTakePositionOf)
    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return

    // 💻
    this.habits = arrayMove(this.habits, oldIndex, newIndex)

    // ☁️
    await this.dbHandler.updateUserDoc(HABITS, {
      order: this.habits.map((habit) => habit.id)
    })
  }

  private addNewHabit = async (newHabit: Habit) => {
    // 💻
    this.habits.push(newHabit)

    // ☁️
    await this.dbHandler.updateUserDoc(HABITS, {
      habits: { [newHabit.id]: { ...exclude(newHabit, 'id') } },
      order: arrayUnion(newHabit.id)
    })

    return this.habits[this.habits.length - 1]
  }

  private processFetchedHabits = (habitsDoc: Fetched<HabitsDocumentData>): Habit[] => {
    if (!habitsDoc) return []

    const habitIds = Object.keys(habitsDoc.habits)
    const order = habitsDoc.order

    for (const habitId of habitIds) {
      if (!order.includes(habitId)) {
        order.push(habitId)
      }
    }

    return order.map(id => ({
      id,
      ...habitsDoc.habits[id]
    }))
  }
}