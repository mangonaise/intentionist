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
  weeklyFrequency?: null | 1 | 2 | 3 | 4 | 5 | 6 | 7
  statuses?: HabitStatuses
  creationTime: number
}

export type HabitStatuses = { [year: number]: { [day: number]: string } }

export type HabitVisibility = 'public' | 'private'

export type HabitDetailsDocumentData = {
  order: string[],
  activeIds: { [habitId: string]: true },
  shared: { [friendUid: string]: string[] }
}

@singleton()
export default class HabitsHandler {
  public order: string[] = []
  public activeHabits: Habit[] = []
  public sharedHabitsIdsByFriend: { [friendUid: string]: string[] } = {}
  public sharedHabitIds: { [habitId: string]: true } = {} // for convenience only

  constructor(initialState: InitialState, private dbHandler: DbHandler) {
    const { activeHabitsDocs, habitDetailsDoc } = initialState.data
    this.processFetchedHabitData(activeHabitsDocs, habitDetailsDoc)
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
    Object.assign(this.activeHabits[index], habitToSet)

    // ☁️
    await this.dbHandler.update(this.dbHandler.habitDocRef(habitToSet.id), habitToSet)

    return this.activeHabits[index]
  }

  public changeHabitVisibility = async (habit: Habit, visibility: HabitVisibility) => {
    if (habit.visibility === visibility) return
    if (this.activeHabits.indexOf(habit) < 0) return

    // 💻
    habit.visibility = visibility

    // ☁️
    await this.dbHandler.update(this.dbHandler.habitDocRef(habit.id), habit)
  }

  public addHabitFromPreset = async (preset: HabitPreset) => {
    await this.setHabit({
      id: generateHabitId(),
      name: preset.name,
      icon: preset.icon,
      palette: preset.palette,
      timeable: preset.timeable,
      visibility: 'private',
      weeklyFrequency: preset.weeklyFrequency,
      archived: false,
      creationTime: getUtcSeconds()
    })
  }

  public deleteHabitById = async (id: string) => {
    const habitToDelete = this.findHabitById(id)
    if (!habitToDelete) throw new Error('Cannot delete a habit that does not exist')

    // 💻
    this.activeHabits = this.activeHabits.filter((habit) => habit !== habitToDelete)
    this.order = this.order.filter((habitId) => id !== habitId)

    // ☁️
    await this.dbHandler.deleteHabit(id)
  }

  public reorderHabitsLocally = (habitToMove: Habit, habitToTakePositionOf: Habit) => {
    console.error('reimplementation required')
    // const oldIndex = this.activeHabits.indexOf(habitToMove)
    // const newIndex = this.activeHabits.indexOf(habitToTakePositionOf)
    // if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return

    // // 💻
    // this.activeHabits = arrayMove(this.activeHabits, oldIndex, newIndex)
  }

  public uploadHabitOrder = async () => {
    console.error('reimplementation required')
    // // ☁️
    // await this.dbHandler.update(this.dbHandler.habitDetailsDocRef(), {
    //   order: this.getOrderedIds()
    // })
  }

  private addNewHabit = async (newHabit: Habit) => {
    // 💻
    this.activeHabits.push(newHabit)
    this.order.push(newHabit.id)

    // ☁️
    await this.dbHandler.addHabit(newHabit)

    return this.activeHabits[this.activeHabits.length - 1]
  }

  public addSharedHabit = async (args: { friendUid: string, habitId: string }) => {
    const { friendUid, habitId } = args

    // 💻
    this.sharedHabitsIdsByFriend[friendUid] = this.sharedHabitsIdsByFriend[friendUid] ?? []
    this.sharedHabitsIdsByFriend[friendUid].push(habitId)
    this.sharedHabitIds[habitId] = true
    this.order.unshift(habitId)

    // ☁️
    await this.dbHandler.addSharedHabit({ friendUid, habitId, newOrder: this.order })
  }

  public removeSharedHabit = async (args: { friendUid: string, habitId: string }) => {
    const { friendUid, habitId } = args

    const sharedHabit = this.sharedHabitsIdsByFriend[friendUid]?.find((id) => id === habitId)
    if (!sharedHabit) return

    // 💻
    this.sharedHabitsIdsByFriend[friendUid] = this.sharedHabitsIdsByFriend[friendUid].filter((id) => id !== habitId)
    this.order = this.order.filter((id) => id !== habitId)
    delete this.sharedHabitIds[habitId]
    const noneRemaining = this.sharedHabitsIdsByFriend[friendUid].length === 0
    if (noneRemaining) delete this.sharedHabitsIdsByFriend[friendUid]


    // ☁️
    await this.dbHandler.removeSharedHabit({ ...args, noneRemaining })
  }

  public findHabitById = (id: string) => {
    return this.activeHabits.find((habit) => habit.id === id)
  }

  private processFetchedHabitData = (activeHabits: Habit[], habitDetails: Fetched<HabitDetailsDocumentData>) => {
    const order: string[] = habitDetails?.order ?? []
    const activeIds = Object.keys(habitDetails?.activeIds ?? {})
    for (const habitId of activeIds) {
      if (!order.includes(habitId)) {
        order.push(habitId)
      }
    }
    this.order = order
    this.activeHabits = activeHabits

    this.sharedHabitsIdsByFriend = habitDetails?.shared ?? {}

    Object.entries(this.sharedHabitsIdsByFriend).forEach(([_, habitIds]) => {
      habitIds.forEach((habitId) => this.sharedHabitIds[habitId] = true)
    })
  }
}

export type HabitPreset = Pick<Habit, 'name' | 'icon' | 'palette' | 'timeable' | 'weeklyFrequency'> & { uniqueText?: string }

export const habitPresets: HabitPreset[] = [
  {
    name: 'Wake up by [5,5:30,6,6:30,7,7:30,8,8:30,9]',
    uniqueText: 'Wake up by',
    icon: '⏰',
    palette: ['👍'],
    timeable: false,
    weeklyFrequency: 7
  },
  {
    name: 'Sleep by [10,10:30,11,11:30,12]',
    uniqueText: 'Sleep by',
    icon: '🌙',
    palette: ['👍'],
    timeable: false,
    weeklyFrequency: 7
  },
  {
    name: 'Drink [6,7,8,9,10] glasses of water',
    uniqueText: 'glasses of water',
    icon: '💧',
    palette: ['👍'],
    timeable: false,
    weeklyFrequency: 7
  },
  {
    name: 'Make bed',
    icon: '🛏️',
    palette: ['👍'],
    timeable: false,
    weeklyFrequency: 7
  },
  {
    name: 'Read',
    icon: '📚',
    palette: ['🌟', '👍', '🤏'],
    timeable: true,
    weeklyFrequency: 7
  },
  {
    name: 'Podcast',
    icon: '📻',
    palette: ['👍', '🤏'],
    timeable: true,
    weeklyFrequency: 7
  },
  {
    name: 'Exercise',
    icon: '🏃',
    palette: ['🌟', '👍', '🤏'],
    timeable: true,
    weeklyFrequency: 7
  },
  {
    name: 'Stretch',
    icon: '🙆',
    palette: ['🌟', '👍', '🤏'],
    timeable: true,
    weeklyFrequency: 7
  },
  {
    name: 'Yoga',
    icon: '🧘',
    palette: ['🌟', '👍', '🤏'],
    timeable: true,
    weeklyFrequency: 7
  },
  {
    name: 'Meditate',
    icon: '🌸',
    palette: ['🌟', '👍', '🤏'],
    timeable: true,
    weeklyFrequency: 7
  },
  {
    name: 'Journal',
    icon: '✏️',
    palette: ['👍', '🤏'],
    timeable: true,
    weeklyFrequency: 7
  },
  {
    name: 'No phone in bed',
    icon: '📴',
    palette: ['👍'],
    timeable: false,
    weeklyFrequency: 7
  },
  {
    name: 'Tidy space',
    icon: '🧹',
    palette: ['🌟', '👍'],
    timeable: true,
    weeklyFrequency: 7
  },
  {
    name: 'Healthy eating',
    icon: '🍎',
    palette: ['🌟', '👍'],
    timeable: false,
    weeklyFrequency: 7
  },
  {
    name: 'Me time',
    icon: '💖',
    palette: ['🌟', '👍', '🤏'],
    timeable: true,
    weeklyFrequency: 7
  },
  {
    name: 'Wakefulness',
    icon: '⚡',
    palette: ['🤩', '👍', '🆗', '🥱'],
    timeable: false,
    weeklyFrequency: null
  },
  {
    name: 'Mood',
    icon: '🙂',
    palette: ['😊', '🙂', '😐', '😢', '😒', '😬', '😠'],
    timeable: false,
    weeklyFrequency: null
  }
]