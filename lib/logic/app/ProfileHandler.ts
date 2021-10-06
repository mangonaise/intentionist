import { Lifecycle, scoped } from 'tsyringe'
import { makeAutoObservable } from 'mobx'
import { InitialState } from './InitialFetchHandler'
import isEqual from 'lodash/isEqual'
import DbHandler from './DbHandler'

export type ProfileInfo = {
  displayName: string
}

@scoped(Lifecycle.ContainerScoped)
export default class ProfileHandler {
  private dbHandler: DbHandler
  public profileInfo: ProfileInfo | null

  constructor(initialState: InitialState, dbHandler: DbHandler) {
    this.profileInfo = initialState.data.userProfile
    this.dbHandler = dbHandler
    makeAutoObservable(this)
  }

  public updateUserProfile = async (info: ProfileInfo) => {
    if (isEqual(info, this.profileInfo)) return this.profileInfo
    this.profileInfo = info
    await this.dbHandler.updateUserDoc('', { profile: info })
    return this.profileInfo
  }
}