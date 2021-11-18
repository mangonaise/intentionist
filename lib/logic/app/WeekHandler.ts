import { singleton } from 'tsyringe'
import { makeAutoObservable, runInAction, when } from 'mobx'
import { InitialState } from '@/logic/app/InitialFetchHandler'
import { formatFirstDayOfThisWeek } from '@/logic/utils/dateUtilities'
import HabitsHandler, { Habit } from '@/logic/app/HabitsHandler'
import WeekInView, { WeekDocumentData } from '@/logic/app/WeekInView'
import DbHandler from '@/logic/app/DbHandler'
import FriendActivityHandler from '@/logic/app/FriendActivityHandler'

@singleton()
export default class WeekHandler {
  public latestWeekStartDate: string

  constructor(
    initialAppState: InitialState,
    private dbHandler: DbHandler,
    private habitsHandler: HabitsHandler,
    private friendActivityHandler: FriendActivityHandler,
    public weekInView: WeekInView
  ) {
    this.latestWeekStartDate = initialAppState.data.latestWeekDoc?.startDate ?? formatFirstDayOfThisWeek()
    const weekData = initialAppState.data.latestWeekDoc ?? { startDate: this.latestWeekStartDate }

    runInAction(() => {
      this.weekInView.setWeek({
        weekData,
        userHabits: habitsHandler.habits,
        isCondensable: this.getIsWeekCondensable(weekData.startDate)
      })
    })

    makeAutoObservable(this)
  }

  public viewWeek = async (args: { startDate: string, friendUid?: string, cachedIcon?: string }) => {
    const { startDate, friendUid, cachedIcon } = args

    if (this.isAlreadyViewingWeek(startDate, friendUid)) return

    this.weekInView.setLoadingState(startDate, friendUid, cachedIcon)
    await when(() => this.dbHandler.isWriteComplete)
    const { weekData, habits } = await this.getWeekDataAndHabits(startDate, friendUid)
    this.handleLoadedWeek(weekData, habits, friendUid)
  }

  private handleLoadedWeek = (weekData: WeekDocumentData, habits: Habit[], friendUid?: string) => {
    if (!friendUid && new Date(weekData.startDate) > new Date(this.latestWeekStartDate)) {
      this.latestWeekStartDate = weekData.startDate
      this.dbHandler.updateWeekDoc(weekData.startDate, {})
    }

    this.weekInView.setWeek({
      friendUid,
      weekData,
      userHabits: habits.map((habit) => ({ ...habit, friendUid })),
      isCondensable: this.getIsWeekCondensable(weekData.startDate, friendUid)
    })
  }

  private getWeekDataAndHabits = async (startDate: string, friendUid?: string) => {
    if (friendUid) {
      return await this.friendActivityHandler.listenToFriendActivity(startDate, friendUid)
    }

    this.friendActivityHandler.stopListeningToFriendActivity()
    const weekData = await this.dbHandler.getWeekDoc(startDate, friendUid) ?? { startDate }
    const habits = this.habitsHandler.habits

    return { weekData, habits }
  }

  private getIsWeekCondensable = (startDate: string, friendUid?: string) => {
    if (friendUid) {
      return startDate < formatFirstDayOfThisWeek()
    } else {
      return startDate < this.latestWeekStartDate
    }
  }

  private isAlreadyViewingWeek = (startDate: string, friendUid?: string) => {
    return startDate === this.weekInView.weekData.startDate && friendUid === this.weekInView.friendUid
  }
}