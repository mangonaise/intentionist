import { makeAutoObservable } from 'mobx'
import { singleton } from 'tsyringe'
import { InitialState } from '@/logic/app/InitialFetchHandler'
import DbHandler from '@/logic/app/DbHandler'
import isEqual from 'lodash/isEqual'

export type Habit = {
  id: string
  name: string
  icon: string
  palette: string[]
  timeable: boolean
  archived?: boolean
  statuses?: { [year: number]: { [day: number]: string } }
  creationTime: number
}

@singleton()
export default class HabitsHandler {
  public habits: Habit[]

  constructor(initialState: InitialState, private dbHandler: DbHandler) {
    this.habits = this.processFetchedHabits(initialState.data.habitsDocs)
    makeAutoObservable(this)
  }

  public setHabit = async (habitToSet: Habit) => {
    let existingHabit = this.findHabitById(habitToSet.id)
    if (!existingHabit) {
      return await this.addNewHabit(habitToSet)
    }
    if (isEqual(existingHabit, habitToSet)) return existingHabit

    console.warn('setHabit not implemented')

    // 💻
    // ☁️
  }

  public addHabitFromPreset = async (preset: HabitPreset) => {
    console.warn('addHabitFromPreset not implemented')
  }

  public deleteHabitById = async (id: string) => {
    const habitToDelete = this.findHabitById(id)
    if (!habitToDelete) throw new Error('Cannot delete a habit that does not exist')

    console.warn('deleteHabitById not implemented')
  }

  public reorderHabits = async (habitToMove: Habit, habitToTakePositionOf: Habit) => {
    console.warn('reorderHabits not implemented')
  }

  private addNewHabit = async (newHabit: Habit) => {
    console.warn('addNewHabit not implemented')
  }

  public findHabitById = (id: string) => {
    return this.habits.find((habit) => habit.id === id)
  }

  private processFetchedHabits = (habitsDocs: Habit[]) => {
    console.warn('processFetchedHabits not implemented')
    return [] as Habit[]
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
    palette: ['🌟', '👍', '🤏'],
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
    palette: ['🌟', '👍', '🤏'],
    timeable: true
  },
  {
    name: 'Stretch',
    icon: '🙆',
    palette: ['🌟', '👍', '🤏'],
    timeable: true
  },
  {
    name: 'Yoga',
    icon: '🧘',
    palette: ['🌟', '👍', '🤏'],
    timeable: true
  },
  {
    name: 'Meditate',
    icon: '🌸',
    palette: ['🌟', '👍', '🤏'],
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
    palette: ['🌟', '👍', '🆗', '👎'],
    timeable: true
  },
  {
    name: 'Healthy eating',
    icon: '🍎',
    palette: ['🌟', '👍', '🆗', '👎'],
    timeable: false
  },
  {
    name: 'Me time',
    icon: '💖',
    palette: ['🌟', '👍', '🤏', '👎'],
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
    palette: ['😊', '🙂', '😐', '😢', '😒', '😬', '😠'],
    timeable: false
  }
]