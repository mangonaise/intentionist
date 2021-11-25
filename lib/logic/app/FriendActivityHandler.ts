import { singleton } from 'tsyringe'
import { makeAutoObservable, runInAction, when } from 'mobx'
import { QuerySnapshot, DocumentSnapshot, DocumentData, onSnapshot, query, where } from '@firebase/firestore'
import { Unsubscribe } from '@firebase/util'
import HabitsHandler, { Habit } from '@/logic/app/HabitsHandler'
import DbHandler from '@/logic/app/DbHandler'
import HabitStatusesHandler from '@/logic/app/HabitStatusesHandler'

type HabitWithFriendUid = Habit & { friendUid: string }

@singleton()
export default class FriendActivityHandler {
  public friendHabits: HabitWithFriendUid[] = []

  // keep track of listeners for shared habits (for viewing your own habits page)
  private sharedHabitListenerUnsubscribes: { [friendUid: string]: Unsubscribe } = {}
  private hasLoadedSharedHabits = false

  // keep track of listeners for unshared habits (for viewing a friend's habits page)
  private habitOrderListenerUnsubscribe: Unsubscribe | null = null
  private unsharedHabitsListenerUnsubscribe: Unsubscribe | null = null
  private unsharedListenerLoadingStates = { hasLoadedHabitOrder: false, hasLoadedHabits: false }

  constructor(private dbHandler: DbHandler, private statusesHandler: HabitStatusesHandler, private habitsHandler: HabitsHandler) {
    makeAutoObservable(this)
  }

  public listenToSharedHabits = async () => {
    this.hasLoadedSharedHabits = false

    // todo: some things

    runInAction(() => {
      this.hasLoadedSharedHabits = true
    })
  }

  public listenToUnsharedHabits = async (friendUid: string, onChange: (order?: string[]) => void) => {
    this.stopListeningToUnsharedHabits()

    this.habitOrderListenerUnsubscribe = onSnapshot(
      this.dbHandler.habitDetailsDocRef(friendUid),
      (snapshot) => this.handleHabitDetailsDocSnapshot({ snapshot, onChange }))

    this.unsharedHabitsListenerUnsubscribe = onSnapshot(
      this.generateUnsharedHabitsListenerQuery(friendUid),
      (snapshot) => this.handleUnsharedHabitsSnapshot({ snapshot, friendUid, onChange })
    )

    await when(() =>
      this.unsharedListenerLoadingStates.hasLoadedHabitOrder &&
      this.unsharedListenerLoadingStates.hasLoadedHabits
    )
  }

  public stopListeningToUnsharedHabits = () => {
    this.habitOrderListenerUnsubscribe?.()
    this.unsharedHabitsListenerUnsubscribe?.()
    this.habitOrderListenerUnsubscribe = null
    this.unsharedHabitsListenerUnsubscribe = null
    this.unsharedListenerLoadingStates = { hasLoadedHabitOrder: false, hasLoadedHabits: false }
  }

  private generateUnsharedHabitsListenerQuery = (friendUid: string) => {
    const sharedHabitIds = this.habitsHandler.sharedHabitsIdsByFriend[friendUid]
    let queryConditions = [where('visibility', '==', 'public'), where('archived', '==', false)]

    if (sharedHabitIds?.length) {
      queryConditions.push(where('id', 'not-in', this.habitsHandler.sharedHabitsIdsByFriend[friendUid]))
    }

    return query(this.dbHandler.habitsCollectionRef(friendUid), ...queryConditions)
  }

  private handleUnsharedHabitsSnapshot = (args: { snapshot: QuerySnapshot<DocumentData>, friendUid: string, onChange: () => void }) => {
    const { snapshot, friendUid, onChange } = args

    const habitsInSnapshot = snapshot.docs.map((doc) => {
      const habit = doc.data() as Habit
      this.statusesHandler.refreshStreak(habit)
      return { ...habit, friendUid }
    })

    // * when data changes, refresh the relevant habits in friendHabits (i.e. the unshared ones)
    // you can't just compare against habitsInSnapshot because the query contents might change
    // (e.g. if the friend removes a habit or makes it private)
    this.friendHabits = this.removeUnsharedHabitsFromArrayByFriend(this.friendHabits, friendUid)
    this.friendHabits.push(...habitsInSnapshot)

    onChange()

    runInAction(() => {
      this.unsharedListenerLoadingStates.hasLoadedHabits = true
    })
  }

  private handleHabitDetailsDocSnapshot = (args: { snapshot: DocumentSnapshot<DocumentData>, onChange: (order: string[]) => void }) => {
    const { snapshot, onChange } = args

    const order = snapshot.data()?.order ?? []
    onChange(order)

    runInAction(() => {
      this.unsharedListenerLoadingStates.hasLoadedHabitOrder = true
    })
  }

  private removeUnsharedHabitsFromArrayByFriend = (habitsArray: HabitWithFriendUid[], friendUid: string) => {
    return habitsArray.filter((habit) => {
      const matchesFriend = habit.friendUid === friendUid
      const isSharedHabit = () => this.habitsHandler.sharedHabitsIdsByFriend[friendUid]?.some((habitId) => habitId === habit.id)
      if (matchesFriend && !isSharedHabit()) {
        return false
      }
      return true
    })
  }
}