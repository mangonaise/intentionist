import { makeAutoObservable } from 'mobx'
import { Lifecycle, scoped } from 'tsyringe'
import { deleteField } from '@firebase/firestore'
import DbHandler from './DbHandler'
import WeekHandler from './WeekHandler'

@scoped(Lifecycle.ContainerScoped)
export default class WeekIconsHandler {
  private weekHandler
  private dbHandler

  constructor(weekHandler: WeekHandler, dbHandler: DbHandler) {
    this.weekHandler = weekHandler
    this.dbHandler = dbHandler
    makeAutoObservable(this)
  }

  public setIcon = async (icon: string) => {
    // 💻
    this.weekHandler.weekInView.icon = icon

    // ☁️
    await this.dbHandler.updateWeekDoc(this.weekHandler.weekInView.startDate, { icon })
  }

  public removeIcon = async () => {
    // 💻
    this.weekHandler.weekInView.icon = null

    // ☁️
    await this.dbHandler.updateWeekDoc(this.weekHandler.weekInView.startDate, { icon: deleteField() })
  }
}