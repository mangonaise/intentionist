import { singleton } from 'tsyringe'
import { makeAutoObservable, runInAction, when } from 'mobx'
import { DocumentSnapshot, DocumentData, onSnapshot } from '@firebase/firestore'
import { Unsubscribe } from '@firebase/util'
import { getFirstDayOfThisWeek } from '@/logic/utils/dateUtilities'
import HabitStatusesHandler, { YearAndDay } from '@/logic/app/HabitStatusesHandler'
import HabitsHandler, { Habit, HabitDetailsDocumentData } from '@/logic/app/HabitsHandler'
import DbHandler from '@/logic/app/DbHandler'
import FriendsHandler from '@/logic/app/FriendsHandler'
import getYearAndDay from '@/logic/utils/getYearAndDay'

export type FriendHabit = Habit & { friendUid: string }

@singleton()
export default class DisplayedHabitsHandler {
  public habitsInView: Array<Habit | FriendHabit> = []

  public isLoadingHabits = true
  public selectedWeekStartDate = getYearAndDay(getFirstDayOfThisWeek())
  public selectedFriendUid: string | null = null
  private selectedFriendHabitOrder: string[] = []

  private friendHabits: { [habitId: string]: FriendHabit } = {}
  private habitListeners: Array<{ habitId: string, friendUid: string, unsubscribe: Unsubscribe }> = []
  private habitDetailsListenerUnsubscribe: Unsubscribe | null = null
  private loadingHabitsCount = 0
  private hasLoadedFriendHabitDetails = false

  constructor(
    private dbHandler: DbHandler,
    private habitsHandler: HabitsHandler,
    private statusesHandler: HabitStatusesHandler,
    private friendsHandler: FriendsHandler
  ) {
    this.viewUser(null)
    makeAutoObservable(this)
  }

  public setSelectedWeekStartDate = (startDate: YearAndDay) => {
    this.selectedWeekStartDate = startDate
  }

  public viewUser = async (friendUid: string | null) => {
    if (friendUid && this.selectedFriendUid === friendUid) return

    this.stopListeningToUnlinkedHabits()

    if (friendUid) {
      await this.viewFriendHabits(friendUid)
    } else {
      await this.viewActiveAndLinkedHabits()
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
        () => this.handleHabitSnapshotError(habitId)
      )
    })
  }

  private handleHabitSnapshot = (args: { snapshot: DocumentSnapshot<DocumentData>, friendUid: string, habitId: string }) => {
    const { snapshot, habitId, friendUid } = args
    const habitInSnapshot = snapshot.data() as Habit | undefined

    if (!habitInSnapshot || habitInSnapshot.archived) {
      return this.handleHabitSnapshotError(habitId)
    }

    this.statusesHandler.refreshStreak(habitInSnapshot)

    const existingHabit = this.friendHabits[habitId]
    if (existingHabit) {
      Object.assign(existingHabit, habitInSnapshot)
    } else {
      this.friendHabits[habitId] = { ...habitInSnapshot, friendUid }
      this.refreshHabitsInView()
    }

    this.loadingHabitsCount = Math.max(this.loadingHabitsCount - 1, 0)
  }

  private handleHabitSnapshotError = (habitId: string) => {
    this.loadingHabitsCount = Math.max(this.loadingHabitsCount - 1, 0)
    this.removeHabitListener(habitId)

    delete this.friendHabits[habitId]
    this.habitsInView = this.habitsInView.filter((habit) => habit.id !== habitId)

    if (this.habitsHandler.linkedHabits[habitId]) {
      this.habitsHandler.removeLinkedHabit(habitId)
    }
  }

  private removeHabitListener = (habitId: string) => {
    const listenerToRemove = this.habitListeners.find((listener) => listener.habitId === habitId)
    listenerToRemove?.unsubscribe?.()
    this.habitListeners = this.habitListeners.filter((listener) => listener !== listenerToRemove)
    delete this.friendHabits[habitId]
  }

  public refreshHabitsInView = () => {
    let newHabitsInView = [] as Habit[]

    const orderedHabitIds = this.selectedFriendUid ? this.selectedFriendHabitOrder : this.habitsHandler.order

    for (const [friendHabitId, { friendUid }] of Object.entries(this.habitsHandler.linkedHabits)) {
      if (!this.friendsHandler.friends.some((friend) => friend.uid === friendUid)) {
        this.habitsHandler.removeLinkedHabit(friendHabitId)
      }
    }

    for (const habitId of orderedHabitIds) {
      const habit = this.habitsHandler.activeHabits[habitId] ?? this.friendHabits[habitId]
      if (habit) {
        newHabitsInView.push(habit)
        if (!this.selectedFriendUid) {
          newHabitsInView.push(...this.getLinkedHabits(habitId))
        }
      }
    }

    this.habitsInView = newHabitsInView
  }

  private viewActiveAndLinkedHabits = async () => {
    this.isLoadingHabits = true
    this.selectedFriendUid = null

    await this.listenToLinkedHabits()
    this.refreshHabitsInView()

    runInAction(() => this.isLoadingHabits = false)
  }

  private listenToLinkedHabits = async () => {
    const linkedHabits = this.habitsHandler.linkedHabits

    for (const habitId of Object.keys(linkedHabits)) {
      this.addHabitListener({ habitId, friendUid: linkedHabits[habitId].friendUid })
    }

    await when(() => this.loadingHabitsCount === 0)
  }

  private viewFriendHabits = async (friendUid: string) => {
    this.isLoadingHabits = true
    this.selectedFriendUid = friendUid
    this.habitsInView = []
    await this.listenToUnlinkedHabits(friendUid)
    runInAction(() => this.isLoadingHabits = false)
  }

  private listenToUnlinkedHabits = async (friendUid: string) => {
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

  private stopListeningToUnlinkedHabits = () => {
    this.habitDetailsListenerUnsubscribe?.()
    this.habitDetailsListenerUnsubscribe = null

    const unlinkedHabitListenerIds = this.habitListeners
      .filter((listener) => !this.habitsHandler.linkedHabits[listener.habitId])
      .map((listener) => listener.habitId)

    unlinkedHabitListenerIds.forEach((habitId) => this.removeHabitListener(habitId))
  }

  private getLinkedHabits = (habitId: string) => {
    const habits: Habit[] = []
    Object.entries(this.habitsHandler.linkedHabits)
      .filter(([_, linkedHabitData]) => linkedHabitData.linkedHabitId === habitId)
      .sort(([_a, { time: timeA }], [_b, { time: timeB }]) => timeA - timeB)
      .forEach(([friendHabitId, linkedHabitData]) => {
        if (this.friendHabits[friendHabitId]) {
          habits.push(this.friendHabits[friendHabitId])
        }
      })
    return habits
  }
}