import AuthUser from './AuthUser'
import { db } from '../../firebase'
import { doc, getDoc, setDoc } from '@firebase/firestore'
import { singleton } from 'tsyringe'

@singleton()
export default class DbHandler {
  private uid

  constructor(authUser: AuthUser) {
    this.uid = authUser.uid
  }

  public userDocRef = (...pathSegments: string[]) => {
    return doc(db, 'users', this.uid, ...pathSegments)
  }

  public getUserDoc = async (...pathSegments: string[]) => {
    return (await getDoc(this.userDocRef(...pathSegments))).data()
  }

  public updateUserDoc = async (path: string, data: object) => {
    await setDoc(this.userDocRef(path), data, { merge: true })
  }
}