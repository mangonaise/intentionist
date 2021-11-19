import { makeAutoObservable } from 'mobx'
import { singleton } from 'tsyringe'
import { Fetched, InitialState } from '@/logic/app/InitialFetchHandler'
import DbHandler from '@/logic/app/DbHandler'
import generateHabitId from '@/logic/utils/generateHabitId'
import getUtcSeconds from '@/logic/utils/getUtcSeconds'
import arrayMove from '@/logic/utils/arrayMove'
import isEqual from 'lodash/isEqual'

export type Habit = {
  id: string
  name: string
  icon: string
  palette: string[]
  timeable: boolean
  archived: boolean,
  visibility: HabitVisibility,
  statuses?: { [year: number]: { [day: number]: string } }
  creationTime: number
}

export type HabitVisibility = 'public' | 'private'

export type HabitDetailsDocumentData = {
  order: string[],
  activeIds: { [habitId: string]: true }
}

@singleton()
export default class HabitsHandler {
  public activeHabits: Habit[]

  constructor(initialState: InitialState, private dbHandler: DbHandler) {
    const { activeHabitsDocs, habitDetailsDoc } = initialState.data
    this.activeHabits = this.processFetchedHabitData(activeHabitsDocs, habitDetailsDoc)
    makeAutoObservable(this)
  }

  public setHabit = async (habitToSet: Habit) => {
    let existingHabit = this.findHabitById(habitToSet.id)
    if (!existingHabit) {
      return await this.addNewHabit(habitToSet)
    }
    if (isEqual(existingHabit, habitToSet)) return existingHabit

    // 💻
    const index = this.activeHabits.indexOf(existingHabit)
    this.activeHabits[index] = habitToSet

    // ☁️
    await this.dbHandler.update(this.dbHandler.habitDocRef(habitToSet.id), habitToSet)

    return this.activeHabits[index]
  }

  public addHabitFromPreset = async (preset: HabitPreset) => {
    await this.setHabit({
      id: generateHabitId(),
      name: preset.name,
      icon: preset.icon,
      palette: preset.palette,
      timeable: preset.timeable,
      visibility: 'private',
      archived: false,
      creationTime: getUtcSeconds()
    })
  }

  public deleteHabitById = async (id: string) => {
    const habitToDelete = this.findHabitById(id)
    if (!habitToDelete) throw new Error('Cannot delete a habit that does not exist')

    // 💻
    this.activeHabits = this.activeHabits.filter((habit) => habit !== habitToDelete)

    // ☁️
    await this.dbHandler.deleteHabit(id)
  }

  public reorderHabits = async (habitToMove: Habit, habitToTakePositionOf: Habit) => {
    const oldIndex = this.activeHabits.indexOf(habitToMove)
    const newIndex = this.activeHabits.indexOf(habitToTakePositionOf)
    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return

    // 💻
    this.activeHabits = arrayMove(this.activeHabits, oldIndex, newIndex)

    // ☁️
    await this.dbHandler.update(this.dbHandler.habitDetailsDocRef(), {
      order: this.getOrderedIds()
    })
  }

  private addNewHabit = async (newHabit: Habit) => {
    // 💻
    this.activeHabits.push(newHabit)

    // ☁️
    await this.dbHandler.addHabit(newHabit)

    return this.activeHabits[this.activeHabits.length - 1]
  }

  public findHabitById = (id: string) => {
    return this.activeHabits.find((habit) => habit.id === id)
  }

  private getOrderedIds = () => {
    return this.activeHabits.map((habit) => habit.id)
  }

  private processFetchedHabitData = (habitsDocs: Habit[], habitDetails: Fetched<HabitDetailsDocumentData>) => {
    const order = habitDetails?.order ?? []
    const activeIds = Object.keys(habitDetails?.activeIds ?? {})
    for (const habitId of activeIds) {
      if (!order.includes(habitId)) {
        order.push(habitId)
      }
    }

    let orderedHabits = [] as Habit[]
    for (const orderedId of order) {
      const habit = habitsDocs.find((habit) => habit.id === orderedId)
      if (habit) orderedHabits.push(habit)
    }

    return orderedHabits
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
    palette: ['👍'],
    timeable: false
  },
  {
    name: 'Tidy space',
    icon: '🧹',
    palette: ['🌟', '👍'],
    timeable: true
  },
  {
    name: 'Healthy eating',
    icon: '🍎',
    palette: ['🌟', '👍'],
    timeable: false
  },
  {
    name: 'Me time',
    icon: '💖',
    palette: ['🌟', '👍', '🤏'],
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