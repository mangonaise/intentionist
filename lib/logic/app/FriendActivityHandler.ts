import { singleton } from 'tsyringe'
import { makeAutoObservable, runInAction, when } from 'mobx'
import { onSnapshot, query, where } from '@firebase/firestore'
import { Habit } from '@/logic/app/HabitsHandler'
import { Unsubscribe } from '@firebase/util'
import DbHandler from '@/logic/app/DbHandler'
import HabitStatusesHandler from '@/logic/app/HabitStatusesHandler'

@singleton()
export default class FriendActivityHandler {
  public friendHabits: Array<Habit & { friendUid: string }> = []
  private habitOrderListenerUnsubscribe: Unsubscribe | null = null
  private habitsListenerUnsubscribe: Unsubscribe | null = null
  private listenerLoadingStates = { hasLoadedHabitOrder: false, hasLoadedHabits: false }

  constructor(private dbHandler: DbHandler, private statusesHandler: HabitStatusesHandler) {
    makeAutoObservable(this)
  }

  public listenToFriendActivity = async (friendUid: string, onChange: (order?: string[]) => void) => {
    this.stopListeningToFriendActivity()

    this.habitOrderListenerUnsubscribe = onSnapshot(this.dbHandler.habitDetailsDocRef(friendUid), (snapshot) => {
      const order = snapshot.data()?.order ?? []
      onChange(order)

      runInAction(() => {
        this.listenerLoadingStates.hasLoadedHabitOrder = true
      })
    })

    const habitsQuery = query(
      this.dbHandler.habitsCollectionRef(friendUid),
      where('visibility', '==', 'public'),
      where('archived', '==', false)
    )

    this.habitsListenerUnsubscribe = onSnapshot(habitsQuery, (snapshot) => {
      const habits = snapshot.docs.map((doc) => {
        const habit = doc.data() as Habit
        this.statusesHandler.refreshStreak(habit)
        return { ...habit, friendUid }
      })
      this.friendHabits = this.friendHabits.filter((habit) => habit.friendUid !== friendUid)
      this.friendHabits = habits
      onChange()

      runInAction(() => {
        this.listenerLoadingStates.hasLoadedHabits = true
      })
    })

    await when(() => this.listenerLoadingStates.hasLoadedHabitOrder && this.listenerLoadingStates.hasLoadedHabits)
  }

  public stopListeningToFriendActivity = () => {
    this.habitOrderListenerUnsubscribe?.()
    this.habitsListenerUnsubscribe?.()
    this.habitOrderListenerUnsubscribe = null
    this.habitsListenerUnsubscribe = null
    this.listenerLoadingStates = { hasLoadedHabitOrder: false, hasLoadedHabits: false }
  }
}