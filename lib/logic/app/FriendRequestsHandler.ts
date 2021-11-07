import type { Functions } from '@firebase/functions'
import { inject, singleton } from 'tsyringe'
import { makeAutoObservable, runInAction } from 'mobx'
import { httpsCallable } from '@firebase/functions'
import { DocumentData, Unsubscribe, onSnapshot } from '@firebase/firestore'
import ProfileHandler, { AvatarAndDisplayName } from '@/logic/app/ProfileHandler'
import DbHandler from '@/logic/app/DbHandler'
import isValidUsername from '@/logic/utils/isValidUsername'

export type UserSearchResult = AvatarAndDisplayName | 'invalid' | 'self' | 'not found' //! | 'already friends' | 'already outgoing' | 'already incoming' | 'max requests' | 'max friends'
export type OutgoingFriendRequestStatus = null | 'sending' | 'sent' | 'recipient-max-requests' | 'error'
export type FriendRequestsViewMode = 'incoming' | 'outgoing'

@singleton()
export default class FriendRequestsHandler {
  public requestsData = {
    incomingUsernames: [] as string[],
    outgoingUsernames: [] as string[],
    incomingViewLimit: 10,
    outgoingViewLimit: 10
  }
  public isUserDataFetchingEnabled = false
  public cachedUserData: { [username: string]: AvatarAndDisplayName } = {}
  public outgoingRequestStatus = null as OutgoingFriendRequestStatus
  public viewMode: FriendRequestsViewMode = 'incoming'
  private profileHandler
  private dbHandler
  private functions
  private listenerUnsubscribe: Unsubscribe | undefined

  constructor(profileHandler: ProfileHandler, dbHandler: DbHandler, @inject('Functions') functions: Functions) {
    this.profileHandler = profileHandler
    this.dbHandler = dbHandler
    this.functions = functions
    makeAutoObservable(this)
  }

  public startListener = () => {
    this.listenerUnsubscribe = onSnapshot(
      this.dbHandler.friendRequestsDocRef,
      (snapshot) => this.handleFriendRequestsSnapshot(snapshot.data())
    )
  }

  public stopListener = () => {
    this.listenerUnsubscribe?.()
  }

  public setViewMode = async (viewMode: FriendRequestsViewMode) => {
    this.viewMode = viewMode
    await this.fetchUserProfiles()
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
      if (userData) {
        this.addUserDataToCache(username, userData)
        return userData
      }
      return 'not found'
    } catch {
      return 'not found'
    }
  }

  public sendFriendRequest = async (recipientUsername: string) => {
    this.outgoingRequestStatus = 'sending'

    try {
      const send = httpsCallable(this.functions, 'sendFriendRequest')
      await send({ recipientUsername })
      runInAction(() => {
        this.outgoingRequestStatus = 'sent'
      })
    } catch (err) {
      let status = 'error' as OutgoingFriendRequestStatus
      const reason = (err as any).details?.reason as string | undefined
      if (reason === 'recipient-max-requests') {
        status = reason
      }
      runInAction(() => {
        this.outgoingRequestStatus = status
      })
    }
  }

  public setUserDataFetchingEnabled = (enabled: boolean) => {
    this.isUserDataFetchingEnabled = enabled
    if (enabled) this.fetchUserProfiles()
  }

  private handleFriendRequestsSnapshot = async (snapshotData: DocumentData | undefined) => {
    if (!snapshotData) return
    this.requestsData.incomingUsernames = this.getSortedUsernames(snapshotData.incoming)
    this.requestsData.outgoingUsernames = this.getSortedUsernames(snapshotData.outgoing)
    await this.fetchUserProfiles()
  }

  private getSortedUsernames = (requests: { [username: string]: { time: number } } | undefined) => {
    if (!requests) requests = {}
    return Object.entries(requests)
      .sort(([_keyA, valueA], [_keyB, valueB]) => valueB.time - valueA.time)
      .map(([username]) => username)
  }

  private fetchUserProfiles = async () => {
    if (!this.isUserDataFetchingEnabled) return
    
    const usernames = this.requestsData[`${this.viewMode}Usernames`]

    let promises: Promise<void>[] = []
    const limit = this.requestsData[`${this.viewMode}ViewLimit`]
    const iterations = Math.min(usernames.length, limit)
    for (let i = 0; i < iterations; i++) {
      const username = usernames[i]
      if (this.cachedUserData[username]) continue
      promises.push((async () => {
        const avatarAndDisplayName = await this.dbHandler.getUsernameDoc(username)
        if (avatarAndDisplayName) {
          this.addUserDataToCache(username, avatarAndDisplayName)
        }
      })())
    }
    await Promise.all(promises)
  }

  private addUserDataToCache = (username: string, userData: AvatarAndDisplayName) => {
    this.cachedUserData[username] = userData
  }
}