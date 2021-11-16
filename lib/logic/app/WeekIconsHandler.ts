import { makeAutoObservable, runInAction } from 'mobx'
import { singleton } from 'tsyringe'
import { separateYYYYfromMMDD } from '@/logic/utils/dateUtilities'
import DbHandler from '@/logic/app/DbHandler'
import WeekHandler from '@/logic/app/WeekHandler'

type WeekIconsCache = {
  [yyyy: string]: { [mmdd: string]: string }
}

@singleton()
export default class WeekIconsHandler {
  // TODO: cache icons for multiple users
  public iconsCache: WeekIconsCache = {}
  private weekHandler
  private dbHandler

  constructor(weekHandler: WeekHandler, dbHandler: DbHandler) {
    this.weekHandler = weekHandler
    this.dbHandler = dbHandler
    this.cacheIconsInYear(new Date().getFullYear().toString())
    makeAutoObservable(this)
  }

  public cacheIconsInYear = async (year: string) => {
    if (this.iconsCache[year]) return this.iconsCache[year]
    this.iconsCache[year] = {}
    const icons = await this.dbHandler.getWeekIconsDoc(year)
    runInAction(() => {
      this.iconsCache[year] = icons ?? {}
    })
  }

  public setIcon = async (icon: string) => {
    if (icon === this.weekHandler.weekInView.data.icon) return

    // 💻
    this.weekHandler.weekInView.data.icon = icon
    const { yyyy, mmdd } = separateYYYYfromMMDD(this.weekHandler.weekInView.data.startDate)
    this.iconsCache[yyyy] = this.iconsCache[yyyy] ?? {}
    this.iconsCache[yyyy][mmdd] = icon

    // ☁️
    await this.dbHandler.updateWeekIcon(this.weekHandler.weekInView.data.startDate, icon)
  }

  public removeIcon = async () => {
    // 💻
    this.weekHandler.weekInView.data.icon = null
    const { yyyy, mmdd } = separateYYYYfromMMDD(this.weekHandler.weekInView.data.startDate)
    delete this.iconsCache[yyyy]?.[mmdd]

    // ☁️
    await this.dbHandler.removeWeekIcon(this.weekHandler.weekInView.data.startDate)
  }
}