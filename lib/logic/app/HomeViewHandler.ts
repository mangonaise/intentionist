import { makeAutoObservable, runInAction } from 'mobx'
import { singleton } from 'tsyringe'
import { getFirstDayOfThisWeek } from '@/logic/utils/dateUtilities'
import { YearAndDay } from '@/logic/app/HabitStatusesHandler'
import HabitsHandler, { Habit } from '@/logic/app/HabitsHandler'
import FriendActivityHandler from '@/logic/app/FriendActivityHandler'
import getYearAndDay from '@/logic/utils/getYearAndDay'

@singleton()
export default class HomeViewHandler {
  public selectedFriendUid: string | null = null
  public selectedWeekStartDate = getYearAndDay(getFirstDayOfThisWeek())
  public habitsInView: Array<Habit & { friendUid?: string }> = []
  public isLoading = true
  private selectedFriendHabitOrder: string[] = []
  
  constructor(private habitsHandler: HabitsHandler, private friendActivityHandler: FriendActivityHandler) {
    makeAutoObservable(this)
  }

  public setSelectedWeekStartDate = (startDate: YearAndDay) => {
    this.selectedWeekStartDate = startDate
  }

  public viewUser = (friendUid: string | null) => {
    if (this.selectedFriendUid === friendUid) return
    if (!friendUid) {
      this.viewActiveAndSharedHabits()
    } else {
      this.viewFriendHabits(friendUid)
    }
  }

  public viewActiveAndSharedHabits = async () => {
    this.selectedFriendUid = null
    this.friendActivityHandler.stopListeningToUnsharedHabits()

    this.isLoading = true

    await new Promise<void>(resolve => resolve()) // * listen to shared habits here

    let newHabitsInView = [] as Habit[]
    for (const habitId of this.habitsHandler.order) {
      const activeHabit = this.habitsHandler.activeHabits.find((habit) => habit.id === habitId)
      if (activeHabit) newHabitsInView.push(activeHabit)
    }

    runInAction(() => {
      this.habitsInView = newHabitsInView
      this.isLoading = false
    })
  }

  private viewFriendHabits = async (friendUid: string) => {
    this.selectedFriendUid = friendUid
    this.habitsInView = []
    this.isLoading = true
    await this.friendActivityHandler.listenToUnsharedHabits(friendUid, this.handleFriendHabitsChange)
    runInAction(() => {
      this.isLoading = false
    })
  }

  private handleFriendHabitsChange = (newOrder?: string[]) => {
    if (newOrder) this.selectedFriendHabitOrder = newOrder
    let newHabitsInView = []
    for (const habitId of this.selectedFriendHabitOrder) {
      const habit = this.friendActivityHandler.friendHabits.find((habit) => habitId === habit.id)
      if (habit) newHabitsInView.push(habit)
    }
    this.habitsInView = newHabitsInView
  }
}