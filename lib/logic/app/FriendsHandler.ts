import { inject, singleton } from 'tsyringe'
import { makeAutoObservable, runInAction } from 'mobx'
import { Functions, httpsCallable } from '@firebase/functions'
import ProfileHandler, { AvatarAndDisplayName } from '@/logic/app/ProfileHandler'
import DbHandler from '@/logic/app/DbHandler'
import isValidUsername from '@/logic/utils/isValidUsername'

export type UserSearchResult = AvatarAndDisplayName | 'invalid' | 'self' | 'not found' //! | 'already friends' | 'already outgoing' | 'already incoming' | 'max requests' | 'max friends'
export type OutgoingFriendRequestStatus = null | 'sending' | 'sent' | 'recipient-max-requests' | 'error'

@singleton()
export default class FriendsHandler {
  public outgoingFriendRequestStatus = null as OutgoingFriendRequestStatus
  private profileHandler
  private dbHandler
  private functions

  constructor(profileHandler: ProfileHandler, dbHandler: DbHandler, @inject('Functions') functions: Functions) {
    this.profileHandler = profileHandler
    this.dbHandler = dbHandler
    this.functions = functions  
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
    // TODO: handle case where you have already sent a friend request to this user
    // TODO: handle case where you have already received a friend request from this user
    // if the target user has friend requests disabled (not yet implemented), the request will fail, so wrap in a try/catch 
    try {
      const userData = await this.dbHandler.getUsernameDoc(username)
      return userData ?? 'not found'
    } catch {
      return 'not found'
    }
  }

  public sendFriendRequest = async (recipientUsername: string) => {
    this.outgoingFriendRequestStatus = 'sending'

    try {
      const send = httpsCallable(this.functions, 'sendFriendRequest')
      await send({ recipientUsername })
      runInAction(() => {
        this.outgoingFriendRequestStatus = 'sent'
      })
    } catch (err) {
      let status = 'error' as OutgoingFriendRequestStatus
      const reason = (err as any).details?.reason as string | undefined
      if (reason === 'recipient-max-requests') {
        status = reason
      }
      runInAction(() => {
        this.outgoingFriendRequestStatus = status
      })
    }
  }
}