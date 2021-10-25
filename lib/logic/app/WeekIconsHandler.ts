import { makeAutoObservable, runInAction } from 'mobx'
import { Lifecycle, scoped } from 'tsyringe'
import { separateYYYYfromMMDD } from '../utils/dateUtilities'
import DbHandler from './DbHandler'
import WeekHandler from './WeekHandler'

type WeekIconsCache = {
  [yyyy: string]: { [mmdd: string]: string }
}

@scoped(Lifecycle.ContainerScoped)
export default class WeekIconsHandler {
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
    if (icon === this.weekHandler.weekInView.icon) return

    // 💻
    this.weekHandler.weekInView.icon = icon
    const { yyyy, mmdd } = separateYYYYfromMMDD(this.weekHandler.weekInView.startDate)
    this.iconsCache[yyyy] = this.iconsCache[yyyy] ?? {}
    this.iconsCache[yyyy][mmdd] = icon

    // ☁️
    await this.dbHandler.updateWeekIcon(this.weekHandler.weekInView.startDate, icon)
  }

  public removeIcon = async () => {
    // 💻
    this.weekHandler.weekInView.icon = null
    const { yyyy, mmdd } = separateYYYYfromMMDD(this.weekHandler.weekInView.startDate)
    delete this.iconsCache[yyyy]?.[mmdd]

    // ☁️
    await this.dbHandler.removeWeekIcon(this.weekHandler.weekInView.startDate)
  }
}