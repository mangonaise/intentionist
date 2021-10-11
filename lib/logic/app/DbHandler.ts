import type { Fetched } from './InitialFetchHandler'
import type { WeekDocumentData } from './WeekHandler'
import { Lifecycle, scoped } from 'tsyringe'
import { makeAutoObservable, runInAction } from 'mobx'
import { collection, doc, getDoc, getDocs, query, setDoc, limit, orderBy } from '@firebase/firestore'
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

  public getWeekDoc = async (weekStartDate: string) => {
    return ((await getDoc(doc(this.weeksCollectionRef, weekStartDate))).data() ?? null) as Fetched<WeekDocumentData>
  }

  public getLatestWeekDoc = async () => {
    const recent = await getDocs(query(this.weeksCollectionRef, orderBy('startDate', 'desc'), limit(1)))
    if (recent.size) {
      return recent.docs[0].data() as WeekDocumentData
    } else {
      return null
    }
  }

  public updateWeekDoc = async (weekStartDate: string, data: Partial<WeekDocumentData> | object) => {
    await this.updateUserDoc(`weeks/${weekStartDate}`, { startDate: weekStartDate, ...data })
  }

  private userDocRef = (...pathSegments: string[]) => {
    return doc(db, 'users', this.uid, ...pathSegments)
  }

  private get weeksCollectionRef() {
    return collection(db, 'users', this.uid, 'weeks')
  }
}