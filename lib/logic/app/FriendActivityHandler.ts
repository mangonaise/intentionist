import { singleton } from 'tsyringe'
import { makeAutoObservable, runInAction, when } from 'mobx'
import { onSnapshot } from '@firebase/firestore'
import { Unsubscribe } from '@firebase/util'
import { Habit, HabitsDocumentData } from '@/logic/app/HabitsHandler'
import WeekInView, { WeekDocumentData } from '@/logic/app/WeekInView'
import DbHandler from '@/logic/app/DbHandler'

type DocListenerBase = {
  friendUid: string,
  isInitialLoadComplete: boolean
  unsubscribe?: Unsubscribe,
}

type WeekDocListener = DocListenerBase & {
  weekData: WeekDocumentData
}

type HabitsDocListener = DocListenerBase & {
  habits: Habit[]
}

@singleton()
export default class FriendActivityHandler {
  public habitsDocListeners: HabitsDocListener[] = []
  private weekDocListeners: WeekDocListener[] = []

  constructor(private dbHandler: DbHandler, private weekInView: WeekInView) {
    makeAutoObservable(this)
  }

  public listenToFriendActivity = async (startDate: string, friendUid: string) => {
    // existingWeekDocListener is currently always undefined because every time this function is called, it's a new week being listened to.
    // however, that won't be the case when shared habits are added, so i'll just leave this here for now
    const existingWeekDocListener = this.weekDocListeners
      .find((listener) => listener.friendUid === friendUid && listener.weekData.startDate === startDate)

    const existingHabitsDocListener = this.habitsDocListeners
      .find((listener) => listener.friendUid === friendUid)

    this.stopListeningToFriendActivity({
      habitsDocListenerToKeep: existingHabitsDocListener
    })

    const [weekData, habits] = await Promise.all([
      existingWeekDocListener?.weekData ?? this.addWeekDocListener(startDate, friendUid),
      existingHabitsDocListener?.habits ?? this.addHabitsDocListener(friendUid)
    ])

    return { weekData, habits }
  }

  private addWeekDocListener = async (startDate: string, friendUid: string) => {
    this.weekDocListeners.push({ friendUid, weekData: { startDate }, isInitialLoadComplete: false })
    const newListener = this.weekDocListeners[this.weekDocListeners.length - 1]

    const weekDocRef = this.dbHandler.weekDocRef(startDate, friendUid)
    newListener.unsubscribe = onSnapshot(weekDocRef, (snapshot) => {
      runInAction(() => {
        const data = snapshot.data() as WeekDocumentData | undefined
        if (data) {
          newListener.weekData = data
          this.weekInView.refreshWeekData(data)
          if (!this.weekInView.isLoadingWeek) {
            this.weekInView.refreshHabitsInView()
          }
        }
        newListener.isInitialLoadComplete = true
      })
    })

    await when(() => newListener.isInitialLoadComplete)
    return newListener.weekData
  }

  private addHabitsDocListener = async (friendUid: string) => {
    this.habitsDocListeners.push({ friendUid, habits: [], isInitialLoadComplete: false })
    const newListener = this.habitsDocListeners[this.habitsDocListeners.length - 1]

    const habitsDocRef = this.dbHandler.habitsDocRef(friendUid)
    newListener.unsubscribe = onSnapshot(habitsDocRef, (snapshot) => {
      runInAction(() => {
        const data = (snapshot.data() ?? { habits: [], order: [] }) as HabitsDocumentData
        const order = data.order
        newListener.habits = order
          .map((id) => ({ id, ...data.habits[id] }))
          .filter((item) => !!item.name) // data for private habits will be undefined, so filter out these
        this.weekInView.refreshHabitsInView(newListener.habits.map((habit) => ({ ...habit, friendUid })))
        newListener.isInitialLoadComplete = true
      })
    })

    await when(() => newListener.isInitialLoadComplete)
    return newListener.habits
  }

  public stopListeningToFriendActivity = (options?: { habitsDocListenerToKeep?: HabitsDocListener }) => {
    const { habitsDocListenerToKeep } = options ?? {}
    const listeners = [...this.weekDocListeners, ...this.habitsDocListeners]
    let newHabitsDocListeners = [] as HabitsDocListener[]
    for (const listener of listeners) {
      if (habitsDocListenerToKeep && listener === habitsDocListenerToKeep) {
        newHabitsDocListeners.push(habitsDocListenerToKeep)
      } else {
        listener.unsubscribe?.()
      }
    }
    this.weekDocListeners = []
    this.habitsDocListeners = newHabitsDocListeners
  }
}