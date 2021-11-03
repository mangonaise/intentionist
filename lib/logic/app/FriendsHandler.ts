import { Lifecycle, scoped } from 'tsyringe'
import { makeAutoObservable } from 'mobx'
import ProfileHandler, { AvatarAndDisplayName } from './ProfileHandler'
import DbHandler from './DbHandler'
import isValidUsername from '../utils/isValidUsername'

export type UserSearchResult = AvatarAndDisplayName | 'invalid' | 'self' | 'not found' //! | 'already friends'

@scoped(Lifecycle.ContainerScoped)
export default class FriendsHandler {
  profileHandler
  dbHandler

  constructor(profileHandler: ProfileHandler, dbHandler: DbHandler) {
    this.profileHandler = profileHandler
    this.dbHandler = dbHandler
    makeAutoObservable(this)
  }

  public searchForUser = async (username: string): Promise<UserSearchResult> => {
    if (username === this.profileHandler.profileInfo?.username) {
      return 'self'
    }
    if (!isValidUsername(username)) {
      return 'invalid'
    }
    // TODO: handle case where the target user is already your friend
    // if the target user has blocked you, or has friend requests disabled (not yet implemented), the request will fail, so wrap in a try/catch 
    try {
      const userData = await this.dbHandler.getUsernameDoc(username)
      return userData ?? 'not found'
    } catch {
      return 'not found'
    }
  }
}