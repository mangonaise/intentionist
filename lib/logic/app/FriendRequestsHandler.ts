import type { Functions } from '@firebase/functions'
import { inject, singleton } from 'tsyringe'
import { makeAutoObservable, runInAction, when } from 'mobx'
import { httpsCallable } from '@firebase/functions'
import { DocumentData, Unsubscribe, onSnapshot } from '@firebase/firestore'
import ProfileHandler, { AvatarAndDisplayName } from '@/logic/app/ProfileHandler'
import FriendsHandler, { maxFriends } from '@/logic/app/FriendsHandler'
import DbHandler from '@/logic/app/DbHandler'
import isValidUsername from '@/logic/utils/isValidUsername'

export type FriendRequest = { username: string, displayName: string, avatar: string }
export type UserSearchResult = AvatarAndDisplayName | 'invalid' | 'self' | 'not found' | 'already friends' | 'already outgoing' | 'already incoming' | 'max friends'
export type PendingFriendRequestStatus = null | 'sending' | 'sent' | 'accepting' | 'accepted' | 'sender-max-requests' | 'recipient-max-requests' | 'sender-max-friends' | 'recipient-max-friends' | 'error'
export type FriendRequestsViewMode = 'incoming' | 'outgoing'

@singleton()
export default class FriendRequestsHandler {
  public incomingRequests: FriendRequest[] = []
  public outgoingRequests: FriendRequest[] = []
  public hasLoadedRequests = false
  public viewMode: FriendRequestsViewMode = 'incoming'
  public pendingStatus = null as PendingFriendRequestStatus
  public newFriendDisplayName?: string
  private listenerUnsubscribe: Unsubscribe | null = null

  constructor(
    private profileHandler: ProfileHandler,
    private dbHandler: DbHandler,
    private friendsHandler: FriendsHandler,
    @inject('Functions') private functions: Functions
  ) {
    makeAutoObservable(this)
  }

  public startListeningToFriendRequests = () => {
    this.setViewMode('incoming')
    if (this.listenerUnsubscribe) return
    this.listenerUnsubscribe = onSnapshot(
      this.dbHandler.friendRequestsDocRef,
      (snapshot) => this.handleFriendRequestsSnapshot(snapshot.data())
    )
  }

  public stopListeningToFriendRequests = () => {
    this.listenerUnsubscribe?.()
    this.listenerUnsubscribe = null
  }

  public setViewMode = async (viewMode: FriendRequestsViewMode) => {
    this.viewMode = viewMode
  }

  public searchForUser = async (username: string): Promise<UserSearchResult> => {
    const failConditions: Array<{ result: UserSearchResult, condition: boolean }> = [
      { result: 'self', condition: username === this.profileHandler.profileInfo?.username },
      { result: 'invalid', condition: !isValidUsername(username) },
      { result: 'already outgoing', condition: this.outgoingRequests.some((request) => request.username === username) },
      { result: 'already incoming', condition: this.incomingRequests.some((request) => request.username === username) },
      { result: 'already friends', condition: this.friendsHandler.friends.some((friend) => friend.username === username) },
      { result: 'max friends', condition: this.friendsHandler.friends.length >= maxFriends }
    ]

    if (!this.friendsHandler.hasLoadedFriends) {
      await when(() => this.friendsHandler.hasLoadedFriends)
    }

    for (const { result, condition } of failConditions) {
      if (condition) return result
    }

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
      runInAction(() => this.pendingStatus = 'sent')
    } catch (err) {
      let status = 'error' as PendingFriendRequestStatus
      const failReason = (err as any).details?.failReason as string | undefined
      if (failReason === 'sender-max-requests' || failReason === 'recipient-max-requests') {
        status = failReason
      }
      runInAction(() => this.pendingStatus = status)
    }
  }

  public cancelOutgoingFriendRequest = async (request: FriendRequest) => {
    const cancel = httpsCallable(this.functions, 'cancelOutgoingFriendRequest')
    await cancel({ recipientUsername: request.username })
  }

  public acceptFriendRequest = async (request: FriendRequest) => {
    const respond = httpsCallable(this.functions, 'respondToFriendRequest')

    this.pendingStatus = 'accepting'

    if (!this.friendsHandler.hasLoadedFriends) {
      await when(() => this.friendsHandler.hasLoadedFriends)
    }

    if (this.friendsHandler.friends.length >= maxFriends) {
      runInAction(() => this.pendingStatus = 'recipient-max-friends')
      return
    }

    try {
      await respond({ senderUsername: request.username, accept: true })
      runInAction(() => {
        this.pendingStatus = 'accepted'
        this.newFriendDisplayName = request.displayName
      })
    } catch (err) {
      let status = 'error' as PendingFriendRequestStatus
      const failReason = (err as any).details?.failReason as string | undefined
      if (failReason === 'sender-max-friends') {
        status = failReason
      }
      runInAction(() => this.pendingStatus = status)
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