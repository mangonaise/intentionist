import { singleton } from 'tsyringe'
import { makeAutoObservable, runInAction, when } from 'mobx'
import { DocumentSnapshot, DocumentData, onSnapshot } from '@firebase/firestore'
import { Unsubscribe } from '@firebase/util'
import { getFirstDayOfThisWeek } from '@/logic/utils/dateUtilities'
import HabitStatusesHandler, { YearAndDay } from '@/logic/app/HabitStatusesHandler'
import HabitsHandler, { Habit, HabitDetailsDocumentData } from '@/logic/app/HabitsHandler'
import DbHandler from '@/logic/app/DbHandler'
import getYearAndDay from '@/logic/utils/getYearAndDay'

export type FriendHabit = Habit & { friendUid: string }

@singleton()
export default class DisplayedHabitsHandler {
  public habitsInView: Array<Habit | FriendHabit> = []

  public isLoadingHabits = true
  public selectedFriendUid: string | null = null
  public selectedWeekStartDate = getYearAndDay(getFirstDayOfThisWeek())
  private selectedFriendHabitOrder: string[] = []

  private friendHabits: FriendHabit[] = []
  private habitListeners: Array<{ habitId: string, friendUid: string, unsubscribe: Unsubscribe }> = []
  private habitDetailsListenerUnsubscribe: Unsubscribe | null = null
  private loadingHabitsCount = 0
  private hasLoadedFriendHabitDetails = false

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

    this.stopListeningToUnsharedHabits()

    if (friendUid) {
      await this.viewFriendHabits(friendUid)
    } else {
      await this.viewActiveAndSharedHabits()
    }
  }

  private addHabitListener = ({ friendUid, habitId }: { friendUid: string, habitId: string }) => {
    if (this.habitListeners.some((listener) => listener.habitId === habitId)) {
      return
    }

    this.loadingHabitsCount += 1
    this.habitListeners.push({
      habitId,
      friendUid,
      unsubscribe: onSnapshot(
        this.dbHandler.habitDocRef(habitId, { friendUid }),
        (snapshot) => this.handleHabitSnapshot({ snapshot, habitId, friendUid }),
        () => this.handleHabitSnapshotError({ friendUid, habitId })
      )
    })
  }

  private handleHabitSnapshot = (args: { snapshot: DocumentSnapshot<DocumentData>, friendUid: string, habitId: string }) => {
    const { snapshot, habitId, friendUid } = args
    const habitInSnapshot = snapshot.data() as Habit | undefined

    if (!habitInSnapshot) {
      return this.handleHabitSnapshotError({ friendUid, habitId })
    }

    this.statusesHandler.refreshStreak(habitInSnapshot)

    const existingHabit = this.friendHabits.find((habit) => habit.friendUid === friendUid && habit.id === habitId)
    if (existingHabit) {
      Object.assign(existingHabit, habitInSnapshot)
    } else {
      this.friendHabits.push({ ...habitInSnapshot, friendUid })
      this.refreshHabitsInView()
    }

    this.loadingHabitsCount = Math.max(this.loadingHabitsCount - 1, 0)
  }

  private handleHabitSnapshotError = ({ friendUid, habitId }: { friendUid: string, habitId: string }) => {
    this.loadingHabitsCount = Math.max(this.loadingHabitsCount - 1, 0)
    this.removeHabitListener(habitId)

    this.friendHabits = this.friendHabits.filter((habit) => habit.id !== habitId)
    this.habitsInView = this.habitsInView.filter((habit) => habit.id !== habitId)

    if (this.habitsHandler.sharedHabitIds[habitId]) {
      this.habitsHandler.removeSharedHabit({ friendUid, habitId })
    }
  }

  private removeHabitListener = (habitId: string) => {
    const listenerToRemove = this.habitListeners.find((listener) => listener.habitId === habitId)
    listenerToRemove?.unsubscribe?.()
    this.habitListeners = this.habitListeners.filter((listener) => listener !== listenerToRemove)
    this.friendHabits = this.friendHabits.filter((habit) => habit.id !== habitId)
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

  private viewActiveAndSharedHabits = async () => {
    this.isLoadingHabits = true
    this.selectedFriendUid = null

    await this.listenToSharedHabits()
    this.refreshHabitsInView()
    runInAction(() => this.isLoadingHabits = false)
  }

  private listenToSharedHabits = async () => {
    const sharedHabitsIdsByFriend = this.habitsHandler.sharedHabitsIdsByFriend

    for (const friendUid of Object.keys(sharedHabitsIdsByFriend)) {
      for (const habitId of sharedHabitsIdsByFriend[friendUid]) {
        this.addHabitListener({ friendUid, habitId })
      }
    }

    await when(() => this.loadingHabitsCount === 0)
  }

  private viewFriendHabits = async (friendUid: string) => {
    this.isLoadingHabits = true
    this.selectedFriendUid = friendUid
    this.habitsInView = []
    await this.listenToUnsharedHabits(friendUid)
    runInAction(() => this.isLoadingHabits = false)
  }

  private listenToUnsharedHabits = async (friendUid: string) => {
    this.hasLoadedFriendHabitDetails = false
    this.habitDetailsListenerUnsubscribe = onSnapshot(
      this.dbHandler.habitDetailsDocRef(friendUid),
      (snapshot) => this.handleHabitDetailsDocSnapshot({ snapshot, friendUid })
    )

    await when(() => this.hasLoadedFriendHabitDetails && this.loadingHabitsCount === 0)
  }

  private handleHabitDetailsDocSnapshot = (args: { snapshot: DocumentSnapshot<DocumentData>, friendUid: string }) => {
    const { snapshot, friendUid } = args
    const data = snapshot.data() as HabitDetailsDocumentData | undefined
    const publicIds = Object.keys(data?.activeIds?.public ?? {})

    const orderedIds = []
    for (const habitId of (data?.order ?? [])) {
      if (publicIds.includes(habitId)) {
        orderedIds.push(habitId)
        this.addHabitListener({ friendUid, habitId })
      }
    }

    this.selectedFriendHabitOrder = orderedIds
    this.hasLoadedFriendHabitDetails = true
    this.refreshHabitsInView()
  }

  private stopListeningToUnsharedHabits = () => {
    this.habitDetailsListenerUnsubscribe?.()
    this.habitDetailsListenerUnsubscribe = null

    const unsharedHabitListenerIds = this.habitListeners
      .filter((listener) => !this.habitsHandler.sharedHabitIds[listener.habitId])
      .map((listener) => listener.habitId)

    unsharedHabitListenerIds.forEach((habitId) => this.removeHabitListener(habitId))
  }
}