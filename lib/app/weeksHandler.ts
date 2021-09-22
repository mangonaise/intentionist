import { makeAutoObservable } from 'mobx'
import authHandler from '../auth'

export type WeekView = 'tracker' | 'journal' | 'focus'

class WeeksHandler {
  private static instance: WeeksHandler
  public view = 'tracker' as WeekView

  private constructor() {
    makeAutoObservable(this)
  }

  public setView = (view: WeekView) => { this.view = view }

  public static getInstance() {
    if (!WeeksHandler.instance) {
      if (!authHandler.user) throw new Error('Should not be instantiating weeks handler when unauthenticated.')
      WeeksHandler.instance = new WeeksHandler()
    }
    return WeeksHandler.instance
  }
}

const weeksHandler = () => WeeksHandler.getInstance()
export default weeksHandler