import { singleton } from 'tsyringe'
import { makeAutoObservable, runInAction } from 'mobx'
import { InitialState } from '@/logic/app/InitialFetchHandler'
import isEqual from 'lodash/isEqual'
import isValidUsername from '@/logic/utils/isValidUsername'
import DbHandler from '@/logic/app/DbHandler'

export type UserProfileInfo = AvatarAndDisplayName & {
  username: string
}

export type AvatarAndDisplayName = {
  displayName: string,
  avatar: string
}

export type UsernameAvailability = 'unknown' | 'checking' | 'invalid' | 'available' | 'taken'

@singleton()
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
    await this.dbHandler.update(this.dbHandler.userDocRef(), info)
    runInAction(() => this.profileInfo = info)
    return this.profileInfo
  }

  public checkUsernameAvailability = async (username: string): Promise<UsernameAvailability> => {
    if (!isValidUsername(username)) {
      return 'invalid'
    }
    const userData = await this.dbHandler.getUsernameDoc(username)
    return userData ? 'taken' : 'available'
  }
}