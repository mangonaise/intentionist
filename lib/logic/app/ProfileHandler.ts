import { Lifecycle, scoped } from 'tsyringe'
import { makeAutoObservable } from 'mobx'
import { InitialState } from './InitialFetchHandler'
import DbHandler from './DbHandler'

export type ProfileInfo = {
  displayName: string
}

@scoped(Lifecycle.ContainerScoped)
export default class ProfileHandler {
  private dbHandler: DbHandler
  public profileInfo: ProfileInfo | null

  constructor(initialState: InitialState, dbHandler: DbHandler) {
    this.profileInfo = initialState.userProfile
    this.dbHandler = dbHandler
    makeAutoObservable(this)
  }

  public updateUserProfile = async (info: ProfileInfo) => {
    this.profileInfo = info
    await this.dbHandler.updateUserDoc('', { profile: info })
  }
}