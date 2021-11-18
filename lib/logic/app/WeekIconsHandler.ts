import { makeAutoObservable, runInAction } from 'mobx'
import { singleton } from 'tsyringe'
import { separateYYYYfromMMDD } from '@/logic/utils/dateUtilities'
import DbHandler from '@/logic/app/DbHandler'
import WeekInView from '@/logic/app/WeekInView'

type WeekIconsCache = {
  [yyyy: string]: { [mmdd: string]: string }
}

@singleton()
export default class WeekIconsHandler {
  // TODO: handle icons for friends
  public iconsCache: WeekIconsCache = {}

  constructor(private weekInView: WeekInView, private dbHandler: DbHandler) {
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
    if (icon === this.weekInView.weekData.icon) return

    // 💻
    this.weekInView.weekData.icon = icon
    const { yyyy, mmdd } = separateYYYYfromMMDD(this.weekInView.weekData.startDate)
    this.iconsCache[yyyy] = this.iconsCache[yyyy] ?? {}
    this.iconsCache[yyyy][mmdd] = icon

    // ☁️
    await this.dbHandler.updateWeekIcon(this.weekInView.weekData.startDate, icon)
  }

  public removeIcon = async () => {
    // 💻
    this.weekInView.weekData.icon = null
    const { yyyy, mmdd } = separateYYYYfromMMDD(this.weekInView.weekData.startDate)
    delete this.iconsCache[yyyy]?.[mmdd]

    // ☁️
    await this.dbHandler.removeWeekIcon(this.weekInView.weekData.startDate)
  }
}