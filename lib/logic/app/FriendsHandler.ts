import { singleton } from 'tsyringe'
import { makeAutoObservable } from 'mobx'
import { Unsubscribe } from '@firebase/util'
import { DocumentData, onSnapshot } from '@firebase/firestore'
import { UserProfileInfo } from '@/logic/app/ProfileHandler'
import DbHandler from '@/logic/app/DbHandler'

@singleton()
export default class FriendsHandler {
  public friends: UserProfileInfo[] = []
  public isUpToDate = false
  private dbHandler
  private listenerUnsubscribe?: Unsubscribe

  constructor(dbHandler: DbHandler) {
    this.dbHandler = dbHandler
    makeAutoObservable(this)
  }

  public listenToFriendsDoc = () => {
    if (this.listenerUnsubscribe) return
    this.listenerUnsubscribe = onSnapshot(
      this.dbHandler.friendsDocRef,
      (snapshot) => this.handleFriendsDocSnapshot(snapshot.data())
    )
  }

  public stopListener = () => {
    this.listenerUnsubscribe?.()
  }

  private handleFriendsDocSnapshot = (friendsDocData: DocumentData | undefined) => {
    this.isUpToDate = true
    const friends = friendsDocData?.friends as undefined | { [uid: string]: UserProfileInfo & { time: number } }
    if (!friends) return
    this.friends = Object.values(friends).sort((friendA, friendB) => friendB.time ?? 0 - friendA.time ?? 0)
  }
}