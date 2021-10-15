import type { Fetched } from './InitialFetchHandler'
import type { WeekDocumentData } from './WeekHandler'
import type { JournalEntryDocumentData } from './JournalEntryEditor'
import { Lifecycle, scoped } from 'tsyringe'
import { makeAutoObservable, runInAction } from 'mobx'
import { collection, doc, getDoc, getDocs, query, setDoc, limit, orderBy, writeBatch, arrayUnion, arrayRemove, deleteField } from '@firebase/firestore'
import { db } from '../../firebase'
import AuthUser from './AuthUser'

const WEEKS = 'weeks'
const USERS = 'users'
const JOURNAL = 'journal'

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
    const weekDoc = await this.getUserDoc(WEEKS, weekStartDate) ?? null
    return weekDoc as Fetched<WeekDocumentData>
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
    await this.updateUserDoc(`${WEEKS}/${weekStartDate}`, { startDate: weekStartDate, ...data })
  }

  public getJournalEntryDoc = async (entryId: string) => {
    const entryDoc = await this.getUserDoc(JOURNAL, entryId) ?? null
    return entryDoc as Fetched<JournalEntryDocumentData>
  }

  public updateJournalEntry = async (entry: JournalEntryDocumentData) => {
    const batch = writeBatch(db)
    batch.set(this.userDocRef(JOURNAL, entry.id), entry, { merge: true })
    batch.set(this.userDocRef(WEEKS, entry.weekStartDate), {
      journalEntries: { [entry.habitId]: arrayUnion(entry.id) },
      journalMetadata: { [entry.id]: { title: entry.title, icon: entry.icon } }
    }, { merge: true })
    await batch.commit()
  }

  public deleteJournalEntry = async (entry: JournalEntryDocumentData) => {
    this.isWriteComplete = false
    const batch = writeBatch(db)
    batch.delete(this.userDocRef(JOURNAL, entry.id))
    batch.set(this.userDocRef(WEEKS, entry.weekStartDate), {
      journalEntries: { [entry.habitId]: arrayRemove(entry.id) },
      journalMetadata: { [entry.id]: deleteField() }
    }, { merge: true })
    await batch.commit()
    runInAction(() => this.isWriteComplete = true)
  }

  private userDocRef = (...pathSegments: string[]) => {
    return doc(db, USERS, this.uid, ...pathSegments)
  }

  private get weeksCollectionRef() {
    return collection(db, USERS, this.uid, WEEKS)
  }
}