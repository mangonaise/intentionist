import { Lifecycle, scoped } from 'tsyringe'
import { makeAutoObservable, runInAction } from 'mobx'
import { InitialState } from './InitialFetchHandler'
import isEqual from 'lodash/isEqual'
import DbHandler from './DbHandler'

export type UserProfileInfo = {
  username: string,
  displayName: string,
  avatar: string
}

export type UsernameAvailability = 'unknown' | 'checking' | 'invalid' | 'available' | 'taken'

@scoped(Lifecycle.ContainerScoped)
export default class ProfileHandler {
  private dbHandler: DbHandler
  public profileInfo: UserProfileInfo | null

  constructor(initialState: InitialState, dbHandler: DbHandler) {
    this.profileInfo = initialState.data.userProfile
    this.dbHandler = dbHandler
    makeAutoObservable(this)
  }

  public setUserProfileInfo = async (info: UserProfileInfo) => {
    if (isEqual(info, this.profileInfo)) return this.profileInfo
    await this.dbHandler.updateUserDoc('', info)
    runInAction(() => this.profileInfo = info)
    return this.profileInfo
  }

  public checkUsernameAvailability = async (username: string): Promise<UsernameAvailability> => {
    if (username.length < 3 || username.length > 30 || !username.match(/^[a-z0-9][a-z0-9]*([_][a-z0-9]+)*$/)) {
      return 'invalid'
    }
    const usernameDoc = await this.dbHandler.getUsernameDoc(username)
    return usernameDoc.exists ? 'taken' : 'available'
  }
}