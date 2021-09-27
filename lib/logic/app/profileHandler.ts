import DbHandler from './DbHandler'
import { makeAutoObservable, runInAction } from 'mobx'
import { singleton } from 'tsyringe'

export type ProfileInfo = {
  displayName: string
}

@singleton()
export default class ProfileHandler {
  private dbHandler: DbHandler
  public profileInfo: ProfileInfo | null | undefined

  constructor(dbHandler: DbHandler) {
    this.dbHandler = dbHandler
    makeAutoObservable(this)
  }

  public fetchUserProfile = async () => {
    if (this.profileInfo !== undefined) return this.profileInfo
    const userDoc = await this.dbHandler.getUserDoc()
    runInAction(() => this.profileInfo = userDoc?.profile || null)
  }

  public updateUserProfile = async (info: ProfileInfo) => {
    this.profileInfo = info
    await this.dbHandler.updateUserDoc('', { profile: info })
  }
}