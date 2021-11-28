import { singleton } from 'tsyringe'
import { makeAutoObservable, runInAction } from 'mobx'
import getCurrentWeekdayId from '@/logic/utils/getCurrentWeekdayId'
import getYearAndDay from '@/logic/utils/getYearAndDay'
import differenceInMilliseconds from 'date-fns/differenceInMilliseconds'
import startOfTomorrow from 'date-fns/startOfTomorrow'

@singleton()
export default class CurrentDateHandler {
  public yearAndDay = getYearAndDay(new Date())
  public weekdayId = getCurrentWeekdayId()
  private dailyTimeout?: NodeJS.Timeout

  constructor() {
    this.setDailyTimeout()
    makeAutoObservable(this)
  }

  public setDailyTimeout = () => {
    if (this.dailyTimeout) clearTimeout(this.dailyTimeout)
    this.dailyTimeout = setTimeout(() => {
      runInAction(() => {
        this.yearAndDay = getYearAndDay(new Date())
        this.weekdayId = getCurrentWeekdayId()
      })
      this.setDailyTimeout()
    }, differenceInMilliseconds(startOfTomorrow(), new Date()))
  }
}