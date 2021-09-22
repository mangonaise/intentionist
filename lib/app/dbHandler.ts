import { doc, getDoc, setDoc, getFirestore } from '@firebase/firestore'
import { firebaseApp } from '../firebase'
import authHandler from '../auth'

export const db = getFirestore(firebaseApp)

class DbHandler {
  public static instance: DbHandler
  private uid

  private constructor(uid: string) {
    this.uid = uid
  }

  private userDocRef(...pathSegments: string[]) {
    return doc(db, 'users', this.uid, ...pathSegments)
  }

  public async getUserDoc(...pathSegments: string[]) {
    return (await getDoc(this.userDocRef(...pathSegments))).data()
  }

  public async updateUserDoc(path: string, data: object) {
    await setDoc(this.userDocRef(path), data, { merge: true })
  }

  public static getInstance() {
    if (!DbHandler.instance) {
      if (!authHandler.user) throw new Error('Should not be instantiating database handler when unauthenticated.')
      DbHandler.instance = new DbHandler(authHandler.user.uid)
    }
    return DbHandler.instance
  }
}

const dbHandler = () => DbHandler.getInstance()
export default dbHandler