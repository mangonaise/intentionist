import { db } from '../../firebase'
import { doc, getDoc, setDoc } from '@firebase/firestore'
import authHandler from './authHandler'

class DbHandler {
  public static instance: DbHandler
  private uid

  private constructor(uid: string) {
    this.uid = uid
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

  public static getInstance = () => {
    if (!DbHandler.instance) {
      if (!authHandler.user) throw new Error('Should not be instantiating database handler when unauthenticated.')
      DbHandler.instance = new DbHandler(authHandler.user.uid)
    }
    return DbHandler.instance
  }
}

const dbHandler = () => DbHandler.getInstance()
export default dbHandler