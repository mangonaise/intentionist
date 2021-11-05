import { singleton } from 'tsyringe'
import { makeAutoObservable } from 'mobx'
import { formatFirstDayOfThisWeek, getFirstDayOfNextWeek, getFirstDayOfThisWeek } from '@/logic/utils/dateUtilities'
import differenceInMilliseconds from 'date-fns/differenceInMilliseconds'
import WeekHandler from '@/logic/app/WeekHandler'

@singleton()
export default class NewWeekPromptHandler {
  public showPrompt = false
  public thisWeekStartDate = getFirstDayOfThisWeek()
  private promptTimeout?: NodeJS.Timeout
  private weekHandler

  constructor(weekHandler: WeekHandler) {
    this.weekHandler = weekHandler
    makeAutoObservable(this)
  }

  public trackNewWeek = () => {
    this.weekHandler.viewWeek(formatFirstDayOfThisWeek())
    this.hidePrompt()
  }

  public checkIsNewWeek = () => {
    this.thisWeekStartDate = getFirstDayOfThisWeek()
    const nextWeekStartDate = getFirstDayOfNextWeek()
    this.showPrompt = new Date(this.weekHandler.latestWeekStartDate) < this.thisWeekStartDate

    if (this.promptTimeout) clearTimeout(this.promptTimeout)

    this.promptTimeout = setTimeout(() => {
      this.checkIsNewWeek()
    }, differenceInMilliseconds(nextWeekStartDate, new Date()))

    return { thisWeekStartDate: this.thisWeekStartDate }
  }

  public hidePrompt = () => {
    this.showPrompt = false
  }
}