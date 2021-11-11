import type { Functions } from '@firebase/functions'
import { inject, singleton } from 'tsyringe'
import { makeAutoObservable, runInAction } from 'mobx'
import { httpsCallable } from '@firebase/functions'
import { DocumentData, Unsubscribe, onSnapshot } from '@firebase/firestore'
import ProfileHandler, { AvatarAndDisplayName } from '@/logic/app/ProfileHandler'
import DbHandler from '@/logic/app/DbHandler'
import isValidUsername from '@/logic/utils/isValidUsername'

export type FriendRequest = { username: string, displayName: string, avatar: string }
export type UserSearchResult = AvatarAndDisplayName | 'invalid' | 'self' | 'not found' //! | 'already friends' | 'already outgoing' | 'already incoming' | 'max requests' | 'max friends'
export type PendingFriendRequestStatus = null | 'sending' | 'sent' | 'accepting' | 'accepted' | 'sender-max-requests' | 'recipient-max-requests' | 'error'
export type FriendRequestsViewMode = 'incoming' | 'outgoing'

@singleton()
export default class FriendRequestsHandler {
  public incomingRequests: FriendRequest[] = []
  public outgoingRequests: FriendRequest[] = []
  public hasLoadedRequests = false
  public viewMode: FriendRequestsViewMode = 'incoming'
  public pendingStatus = null as PendingFriendRequestStatus
  public newFriendDisplayName?: string
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
    this.setViewMode('incoming')
    if (this.listenerUnsubscribe) return
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
    this.pendingStatus = 'sending'

    try {
      const send = httpsCallable(this.functions, 'sendFriendRequest')
      await send({ recipientUsername })
      runInAction(() => {
        this.pendingStatus = 'sent'
      })
    } catch (err) {
      let status = 'error' as PendingFriendRequestStatus
      const reason = (err as any).details?.reason as string | undefined
      if (reason === 'sender-max-requests' || reason === 'recipient-max-requests') {
        status = reason
      }
      runInAction(() => {
        this.pendingStatus = status
      })
    }
  }

  public cancelOutgoingFriendRequest = async (request: FriendRequest) => {
    const cancel = httpsCallable(this.functions, 'cancelOutgoingFriendRequest')
    await cancel({ recipientUsername: request.username })
  }

  public acceptFriendRequest = async (request: FriendRequest) => {
    const respond = httpsCallable(this.functions, 'respondToFriendRequest')
    this.pendingStatus = 'accepting'
    try {
      await respond({ senderUsername: request.username, accept: true })
      runInAction(() => {
        this.pendingStatus = 'accepted'
        this.newFriendDisplayName = request.displayName
      })
    } catch {
      runInAction(() => { this.pendingStatus = 'error' })

    }
  }

  public declineFriendRequest = async (request: FriendRequest) => {
    const respond = httpsCallable(this.functions, 'respondToFriendRequest')
    await respond({ senderUsername: request.username, accept: false })
  }

  private handleFriendRequestsSnapshot = (snapshotData: DocumentData | undefined) => {
    this.hasLoadedRequests = true
    if (!snapshotData) return
    this.incomingRequests = this.sortRequests(snapshotData.incoming)
    this.outgoingRequests = this.sortRequests(snapshotData.outgoing)
  }

  private sortRequests = (requests: { [username: string]: AvatarAndDisplayName & { time: number } } | undefined) => {
    if (!requests) return []
    return Object.entries(requests)
      .sort(([_keyA, valueA], [_keyB, valueB]) => valueB.time - valueA.time)
      .map(([username, data]) => ({
        username,
        displayName: data.displayName,
        avatar: data.avatar
      }))
  }
}