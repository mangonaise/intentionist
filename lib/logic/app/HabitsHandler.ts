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
  order?: string[],
  activeIds?: {
    public?: { [habitId: string]: true },
    private?: { [habitId: string]: true }
  },
  linked?: LinkedHabitsMap
}

type LinkedHabitsMap = { [friendHabitId: string]: { friendUid: string, linkedHabitId: string, time: number } }

@singleton()
export default class HabitsHandler {
  public order: string[] = []
  public activeHabits: { [habitId: string]: Habit } = {}
  public linkedHabits: LinkedHabitsMap = {}

  constructor(initialState: InitialState, private dbHandler: DbHandler) {
    const { activeHabitsDocs, habitDetailsDoc } = initialState.data
    this.processFetchedHabitData(activeHabitsDocs, habitDetailsDoc)
    makeAutoObservable(this)
  }

  public setHabit = async (habitToSet: Habit) => {
    let existingHabit = this.activeHabits[habitToSet.id]
    if (!existingHabit) {
      return await this.addNewHabit(habitToSet)
    }
    if (isEqual(existingHabit, habitToSet)) return existingHabit

    // 💻
    Object.assign(this.activeHabits[habitToSet.id], habitToSet)

    // ☁️
    await this.dbHandler.update(this.dbHandler.habitDocRef(habitToSet.id), habitToSet)

    return this.activeHabits[habitToSet.id]
  }

  public changeHabitVisibility = async (habit: Habit, visibility: HabitVisibility) => {
    if (habit.visibility === visibility) return
    if (!this.activeHabits[habit.id]) return

    // 💻
    habit.visibility = visibility

    // ☁️
    await this.dbHandler.changeHabitVisibility(habit, visibility)
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
    const habitToDelete = this.activeHabits[id]
    if (!habitToDelete) throw new Error('Cannot delete a habit that does not exist')

    const linkedHabitIds = this.getHabitsLinkedWithId(id)

    // 💻
    delete this.activeHabits[id]
    this.order = this.order.filter((habitId) => id !== habitId)
    linkedHabitIds.forEach((id) => delete this.linkedHabits[id])

    // ☁️
    await this.dbHandler.deleteHabit(id, linkedHabitIds)
  }

  // todo: archive habit (make sure linked habits are removed)

  public reorderHabitsLocally = (habitIdToMove: string, habitIdToTakePositionOf: string) => {
    const oldIndex = this.order.indexOf(habitIdToMove)
    const newIndex = this.order.indexOf(habitIdToTakePositionOf)
    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return

    // 💻
    this.order = arrayMove(this.order, oldIndex, newIndex)
  }

  public uploadHabitOrder = async () => {
    // ☁️
    await this.dbHandler.update(this.dbHandler.habitDetailsDocRef(), {
      order: this.order
    })
  }

  private addNewHabit = async (newHabit: Habit) => {
    // 💻
    this.activeHabits[newHabit.id] = newHabit
    this.order.push(newHabit.id)

    // ☁️
    await this.dbHandler.addHabit(newHabit)

    return this.activeHabits[newHabit.id]
  }

  public addLinkedHabit = async (args: { friendHabitId: string, friendUid: string, linkedHabitId: string }) => {
    const { friendHabitId, friendUid, linkedHabitId } = args

    // 💻
    this.linkedHabits[friendHabitId] = { friendUid, linkedHabitId, time: Date.now() }

    // ☁️
    await this.dbHandler.addLinkedHabit(args)
  }

  public removeLinkedHabit = async (friendHabitId: string) => {
    // 💻
    delete this.linkedHabits[friendHabitId]

    // ☁️
    await this.dbHandler.removeLinkedHabit(friendHabitId)
  }

  public getOrderedHabits = () => {
    return this.order.map((habitId) => this.activeHabits[habitId])
  }

  private processFetchedHabitData = (activeHabitsArray: Habit[], habitDetails: Fetched<HabitDetailsDocumentData>) => {
    this.order = habitDetails?.order ?? []

    const publicIds = Object.keys(habitDetails?.activeIds?.public ?? {})
    const privateIds = Object.keys(habitDetails?.activeIds?.private ?? {})
    const activeIds = publicIds.concat(privateIds)

    for (const habitId of activeIds) {
      if (!this.order.includes(habitId)) {
        this.order.push(habitId)
      }
    }

    for (const habit of activeHabitsArray) {
      this.activeHabits[habit.id] = habit
    }

    this.linkedHabits = habitDetails?.linked ?? {}
  }

  private getHabitsLinkedWithId = (deletedHabitId: string) => {
    const friendHabitIds = [] as string[]

    // 💻
    for (const [friendHabitId, linkedHabitData] of Object.entries(this.linkedHabits)) {
      if (linkedHabitData.linkedHabitId === deletedHabitId) {
        friendHabitIds.push(friendHabitId)
      }
    }

    return friendHabitIds
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