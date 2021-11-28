import { singleton } from 'tsyringe'
import { makeAutoObservable, runInAction, when } from 'mobx'
import { QuerySnapshot, DocumentSnapshot, DocumentData, onSnapshot, query, where } from '@firebase/firestore'
import { Unsubscribe } from '@firebase/util'
import { getFirstDayOfThisWeek } from '@/logic/utils/dateUtilities'
import HabitStatusesHandler, { YearAndDay } from '@/logic/app/HabitStatusesHandler'
import HabitsHandler, { Habit } from '@/logic/app/HabitsHandler'
import DbHandler from '@/logic/app/DbHandler'
import getYearAndDay from '@/logic/utils/getYearAndDay'

type HabitWithFriendUid = Habit & { friendUid: string }

@singleton()
export default class DisplayedHabitsHandler {
  public habitsInView: Array<Habit | HabitWithFriendUid> = []

  public isLoadingHabits = true
  public selectedFriendUid: string | null = null
  public selectedWeekStartDate = getYearAndDay(getFirstDayOfThisWeek())
  private selectedFriendHabitOrder: string[] = []

  private friendHabits: HabitWithFriendUid[] = []

  // keep track of listeners for shared habits (for viewing your own habits page)
  private sharedHabitListeners: Array<{ habitId: string, friendUid: string, unsubscribe: Unsubscribe }> = []
  private loadingSharedHabitsCount = 0

  // keep track of listeners for unshared habits (for viewing a friend's habits page)
  private habitOrderListenerUnsubscribe: Unsubscribe | null = null
  private unsharedHabitsListenerUnsubscribe: Unsubscribe | null = null
  private unsharedListenerLoadingStates = { hasLoadedHabitOrder: false, hasLoadedHabits: false }

  constructor(
    private dbHandler: DbHandler,
    private habitsHandler: HabitsHandler,
    private statusesHandler: HabitStatusesHandler,
  ) {
    this.viewUser(null)
    makeAutoObservable(this)
  }

  public setSelectedWeekStartDate = (startDate: YearAndDay) => {
    this.selectedWeekStartDate = startDate
  }

  public viewUser = async (friendUid: string | null) => {
    if (friendUid && this.selectedFriendUid === friendUid) return

    if (!friendUid) {
      await this.viewActiveAndSharedHabits()
    } else {
      await this.viewFriendHabits(friendUid)
    }
  }

  public refreshHabitsInView = () => {
    let newHabitsInView = [] as Habit[]

    const orderedHabitIds = this.selectedFriendUid ? this.selectedFriendHabitOrder : this.habitsHandler.order

    for (const habitId of orderedHabitIds) {
      const habit =
        this.habitsHandler.activeHabits.find((habit) => habit.id === habitId)
        ?? this.friendHabits.find((habit) => habit.id === habitId)
      if (habit) {
        newHabitsInView.push(habit)
      }
    }

    this.habitsInView = newHabitsInView
  }

  //#region 👁️ viewing main page (active and shared habits)
  private viewActiveAndSharedHabits = async () => {
    this.isLoadingHabits = true
    this.selectedFriendUid = null
    this.stopListeningToUnsharedHabits()

    await this.listenToSharedHabits()
    this.refreshHabitsInView()
    runInAction(() => this.isLoadingHabits = false)
  }

  public listenToSharedHabits = async () => {
    const sharedHabitsIdsByFriend = this.habitsHandler.sharedHabitsIdsByFriend

    this.removeUnusedSharedHabitListeners()

    for (const friendUid of Object.keys(sharedHabitsIdsByFriend)) {
      for (const habitId of sharedHabitsIdsByFriend[friendUid]) {
        if (!this.sharedHabitListeners.some((listener) => listener.habitId === habitId)) {
          this.loadingSharedHabitsCount += 1
          this.sharedHabitListeners.push({
            habitId,
            friendUid,
            unsubscribe: onSnapshot(
              this.dbHandler.habitDocRef(habitId, { friendUid }),
              (snapshot) => this.handleSharedHabitSnapshot({ snapshot, habitId, friendUid }),
              () => this.handleSharedHabitLoadError({ friendUid, habitId })
            )
          })
        }
      }
    }

    await when(() => this.loadingSharedHabitsCount === 0)
  }

  private handleSharedHabitSnapshot = (args: { snapshot: DocumentSnapshot<DocumentData>, habitId: string, friendUid: string }) => {
    const { snapshot, habitId, friendUid } = args
    const habitInSnapshot = snapshot.data() as Habit | undefined

    if (!habitInSnapshot) {
      return this.handleSharedHabitLoadError({ friendUid, habitId })
    }

    this.statusesHandler.refreshStreak(habitInSnapshot)

    const existingHabit = this.friendHabits.find((habit) => habit.friendUid === friendUid && habit.id === habitId)
    if (existingHabit) {
      Object.assign(existingHabit, habitInSnapshot)
    } else {
      this.friendHabits.push({ ...habitInSnapshot, friendUid })
    }

    this.loadingSharedHabitsCount = Math.max(this.loadingSharedHabitsCount - 1, 0)
  }

  private handleSharedHabitLoadError = ({ friendUid, habitId }: { friendUid: string, habitId: string }) => {
    this.loadingSharedHabitsCount = Math.max(this.loadingSharedHabitsCount - 1, 0)
    this.habitsHandler.removeSharedHabit({ friendUid, habitId })
    this.removeSharedHabitListener(habitId)

    this.friendHabits = this.friendHabits.filter((habit) => habit.id !== habitId)
    this.habitsInView = this.habitsInView.filter((habit) => habit.id !== habitId)
  }

  private removeUnusedSharedHabitListeners = () => {
    const sharedHabitsIdsByFriend = this.habitsHandler.sharedHabitsIdsByFriend
    for (const listener of this.sharedHabitListeners) {
      if (!sharedHabitsIdsByFriend[listener.friendUid]?.find((habitId) => habitId === listener.habitId)) {
        this.removeSharedHabitListener(listener.habitId)
      }
    }
  }

  private removeSharedHabitListener = (habitId: string) => {
    const listenerToRemove = this.sharedHabitListeners.find((listener) => listener.habitId === habitId)
    listenerToRemove?.unsubscribe?.()
    this.sharedHabitListeners = this.sharedHabitListeners.filter((listener) => listener !== listenerToRemove)
  }
  //#endregion

  //#region 👁️ viewing a specific friend's habits page (including loading unshared habits)
  private viewFriendHabits = async (friendUid: string) => {
    this.isLoadingHabits = true
    this.selectedFriendUid = friendUid
    this.habitsInView = []
    await this.listenToUnsharedHabits(friendUid)
    runInAction(() => this.isLoadingHabits = false)
  }

  public listenToUnsharedHabits = async (friendUid: string) => {
    this.stopListeningToUnsharedHabits()

    this.habitOrderListenerUnsubscribe = onSnapshot(
      this.dbHandler.habitDetailsDocRef(friendUid),
      (snapshot) => this.handleHabitDetailsDocSnapshot(snapshot))

    this.unsharedHabitsListenerUnsubscribe = onSnapshot(
      this.generateUnsharedHabitsListenerQuery(friendUid),
      (snapshot) => this.handleUnsharedHabitsSnapshot({ snapshot, friendUid })
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

  private handleUnsharedHabitsSnapshot = (args: { snapshot: QuerySnapshot<DocumentData>, friendUid: string }) => {
    const { snapshot, friendUid } = args

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

    this.refreshHabitsInView()

    runInAction(() => {
      this.unsharedListenerLoadingStates.hasLoadedHabits = true
    })
  }

  private handleHabitDetailsDocSnapshot = (snapshot: DocumentSnapshot<DocumentData>) => {
    const order = snapshot.data()?.order ?? []
    this.selectedFriendHabitOrder = order

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
  //#endregion
}