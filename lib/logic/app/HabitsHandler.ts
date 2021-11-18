import { arrayUnion } from '@firebase/firestore'
import { makeAutoObservable } from 'mobx'
import { singleton } from 'tsyringe'
import { Fetched, InitialState } from '@/logic/app/InitialFetchHandler'
import DbHandler from '@/logic/app/DbHandler'
import exclude from '@/logic/utils/exclude'
import arrayMove from '@/logic/utils/arrayMove'
import generateHabitId from '@/logic/utils/generateHabitId'
import isEqual from 'lodash/isEqual'

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
  palette?: string[],
  timeable?: boolean,
  friendUid?: string
}

@singleton()
export default class HabitsHandler {
  public habits: Habit[]
  public orderedIds: string[]
  private dbHandler

  constructor(initialState: InitialState, dbHandler: DbHandler) {
    const { habits, order } = this.processFetchedHabits(initialState.data.habitsDoc)
    this.habits = habits
    this.orderedIds = order
    this.dbHandler = dbHandler
    makeAutoObservable(this)
  }

  public setHabit = async (habitToSet: Habit) => {
    let existingHabit = this.findHabitById(habitToSet.id)
    if (!existingHabit) {
      return await this.addNewHabit(habitToSet)
    }
    if (isEqual(existingHabit, habitToSet)) return existingHabit

    // 💻
    const index = this.habits.indexOf(existingHabit)
    this.habits[index] = habitToSet
    this.refreshOrderedIds()

    // ☁️
    await this.dbHandler.update(this.dbHandler.habitsDocRef(), {
      habits: { [habitToSet.id]: { ...exclude(habitToSet, 'id') } }
    })

    return this.habits[index]
  }

  public addHabitFromPreset = async (preset: HabitPreset) => {
    await this.setHabit({
      id: generateHabitId(),
      status: 'active',
      name: preset.name,
      icon: preset.icon,
      palette: preset.palette,
      timeable: preset.timeable
    })
  }

  public deleteHabitById = async (id: string) => {
    const habitToDelete = this.findHabitById(id)
    if (!habitToDelete) throw new Error('Cannot delete a habit that does not exist')

    // 💻
    this.habits = this.habits.filter(habit => habit !== habitToDelete)
    this.refreshOrderedIds()

    // ☁️
    await this.dbHandler.deleteHabit(id)
  }

  public reorderHabits = async (habitToMove: Habit, habitToTakePositionOf: Habit) => {
    const oldIndex = this.habits.indexOf(habitToMove)
    const newIndex = this.habits.indexOf(habitToTakePositionOf)
    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return

    // 💻
    this.habits = arrayMove(this.habits, oldIndex, newIndex)
    this.refreshOrderedIds()

    // ☁️
    await this.dbHandler.update(this.dbHandler.habitsDocRef(), {
      order: this.habits.map((habit) => habit.id)
    })
  }

  private addNewHabit = async (newHabit: Habit) => {
    // 💻
    this.habits.push(newHabit)
    this.refreshOrderedIds()

    // ☁️
    await this.dbHandler.update(this.dbHandler.habitsDocRef(), {
      habits: { [newHabit.id]: { ...exclude(newHabit, 'id') } },
      order: arrayUnion(newHabit.id)
    })

    return this.habits[this.habits.length - 1]
  }

  public findHabitById = (id: string) => {
    return this.habits.find((habit) => habit.id === id)
  } 

  private refreshOrderedIds = () => {
    this.orderedIds = this.habits.map((habit) => habit.id)
  }

  private processFetchedHabits = (habitsDoc: Fetched<HabitsDocumentData>) => {
    if (!habitsDoc) return { habits: [], order: [] }

    const habitIds = Object.keys(habitsDoc.habits)
    const order = habitsDoc.order

    for (const habitId of habitIds) {
      if (!order.includes(habitId)) {
        order.push(habitId)
      }
    }

    return {
      habits: order.map((id) => ({ id, ...habitsDoc.habits[id] })),
      order
    }
  }
}

export type HabitPreset = Pick<Habit, 'name' | 'icon' | 'palette' | 'timeable'> & { uniqueText?: string }

export const habitPresets: HabitPreset[] = [
  {
    name: 'Wake up by [5,5:30,6,6:30,7,7:30,8,8:30,9]',
    uniqueText: 'Wake up by',
    icon: '⏰',
    palette: ['👍'],
    timeable: false,
  },
  {
    name: 'Sleep by [10,10:30,11,11:30,12]',
    uniqueText: 'Sleep by',
    icon: '🌙',
    palette: ['👍'],
    timeable: false,
  },
  {
    name: 'Drink [6,7,8,9,10] glasses of water',
    uniqueText: 'glasses of water',
    icon: '💧',
    palette: ['👍'],
    timeable: false
  },
  {
    name: 'Make bed',
    icon: '🛏️',
    palette: ['👍'],
    timeable: false
  },
  {
    name: 'Read',
    icon: '📚',
    palette: ['⭐', '👍', '🤏'],
    timeable: true
  },
  {
    name: 'Podcast',
    icon: '📻',
    palette: ['👍', '🤏'],
    timeable: true
  },
  {
    name: 'Exercise',
    icon: '🏃',
    palette: ['⭐', '👍', '🤏'],
    timeable: true
  },
  {
    name: 'Stretch',
    icon: '🙆',
    palette: ['⭐', '👍', '🤏'],
    timeable: true
  },
  {
    name: 'Yoga',
    icon: '🧘',
    palette: ['⭐', '👍', '🤏'],
    timeable: true
  },
  {
    name: 'Meditate',
    icon: '🌸',
    palette: ['⭐', '👍', '🤏'],
    timeable: true
  },
  {
    name: 'Journal',
    icon: '✏️',
    palette: ['👍', '🤏'],
    timeable: true
  },
  {
    name: 'No phone in bed',
    icon: '📴',
    palette: ['👍', '👎'],
    timeable: false
  },
  {
    name: 'Tidy space',
    icon: '🧹',
    palette: ['⭐', '👍', '🆗', '👎'],
    timeable: true
  },
  {
    name: 'Healthy eating',
    icon: '🍎',
    palette: ['⭐', '👍', '🆗', '👎'],
    timeable: false
  },
  {
    name: 'Me time',
    icon: '💖',
    palette: ['⭐', '👍', '🤏', '👎'],
    timeable: true
  },
  {
    name: 'Wakefulness',
    icon: '⚡',
    palette: ['🤩', '👍', '🆗', '🥱'],
    timeable: false
  },
  {
    name: 'Mood',
    icon: '🙂',
    palette: ['😊', '🙂', '😐', '😢', '😒', '😬', '😠']
  }
]