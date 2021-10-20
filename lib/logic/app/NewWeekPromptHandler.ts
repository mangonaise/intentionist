import differenceInMilliseconds from 'date-fns/differenceInMilliseconds'
import { makeAutoObservable } from 'mobx'
import { Lifecycle, scoped } from 'tsyringe'
import { formatFirstDayOfThisWeek, getFirstDayOfNextWeek, getFirstDayOfThisWeek } from '../utils/dateUtilities'
import WeekHandler from './WeekHandler'

@scoped(Lifecycle.ContainerScoped)
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
    this.showPrompt = false
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
}