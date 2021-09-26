import DbHandler from './DbHandler'
import { makeAutoObservable } from 'mobx'
import { singleton } from 'tsyringe'

export type WeekView = 'tracker' | 'journal' | 'focus'

@singleton()
export default class WeeksHandler {
  private dbHandler: DbHandler
  public view = 'tracker' as WeekView

  constructor(dbHandler: DbHandler) {
    this.dbHandler = dbHandler
    makeAutoObservable(this)
  }

  public setView = (view: WeekView) => { this.view = view }
}