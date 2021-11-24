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
  public habitsInView: Array<Habit & { friendUid?: string }>
  public isLoadingFriendActivity = false
  private selectedFriendHabitOrder: string[] = []

  constructor(private habitsHandler: HabitsHandler, private friendActivityHandler: FriendActivityHandler) {
    this.habitsInView = habitsHandler.activeHabits
    makeAutoObservable(this)
  }

  public setSelectedWeekStartDate = (startDate: YearAndDay) => {
    this.selectedWeekStartDate = startDate
  }

  public viewUser = (friendUid: string | null) => {
    if (this.selectedFriendUid === friendUid) return
    if (!friendUid) {
      this.selectedFriendUid = null
      this.habitsInView = this.habitsHandler.activeHabits
      this.friendActivityHandler.stopListeningToFriendActivity()
    } else {
      this.viewFriend(friendUid)
    }
  }

  private viewFriend = async (friendUid: string) => {
    this.selectedFriendUid = friendUid
    this.habitsInView = []
    this.isLoadingFriendActivity = true
    await this.friendActivityHandler.listenToFriendActivity(friendUid, this.handleFriendHabitsChange)
    runInAction(() => {
      this.isLoadingFriendActivity = false
    })
  }

  private handleFriendHabitsChange = (newOrder?: string[]) => {
    if (newOrder) this.selectedFriendHabitOrder = newOrder
    this.habitsInView = this.selectedFriendHabitOrder
      .map((habitId) => this.friendActivityHandler.friendHabits.find((habit) => habitId === habit.id))
      .filter((habit) => !!habit) as Array<Habit & { friendUid?: string }>
  }
}