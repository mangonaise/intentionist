import { Lifecycle, scoped } from 'tsyringe'
import { makeAutoObservable, runInAction } from 'mobx'
import { doc, getDoc, setDoc } from '@firebase/firestore'
import { db } from '../../firebase'
import AuthUser from './AuthUser'

@scoped(Lifecycle.ContainerScoped)
export default class DbHandler {
  private uid
  public isWriteComplete = true

  constructor(authUser: AuthUser) {
    this.uid = authUser.uid
    makeAutoObservable(this)
  }

  public getUserDoc = async (...pathSegments: string[]) => {
    return (await getDoc(this.userDocRef(...pathSegments))).data()
  }

  public updateUserDoc = async (path: string, data: object) => {
    this.isWriteComplete = false
    await setDoc(this.userDocRef(path), data, { merge: true })
    runInAction(() => this.isWriteComplete = true)
  }

  private userDocRef = (...pathSegments: string[]) => {
    return doc(db, 'users', this.uid, ...pathSegments)
  }
}