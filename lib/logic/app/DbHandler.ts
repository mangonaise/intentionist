import type { Firestore } from 'firebase/firestore'
import type { Fetched } from './InitialFetchHandler'
import type { WeekDocumentData } from './WeekHandler'
import type { JournalEntryDocumentData } from './JournalEntryEditor'
import type { AvatarAndDisplayName } from './ProfileHandler'
import { inject, Lifecycle, scoped } from 'tsyringe'
import { makeAutoObservable } from 'mobx'
import { collection, doc, getDoc, getDocs, query, setDoc, limit, orderBy, writeBatch, arrayUnion, arrayRemove, deleteField, where, deleteDoc } from '@firebase/firestore'
import { separateYYYYfromMMDD } from '../utils/dateUtilities'
import AuthUser from './AuthUser'

const USERS = 'users'
const USERNAMES = 'usernames'
const WEEKS = 'weeks'
const WEEK_ICONS = 'weekIcons'
const JOURNAL = 'journal'
export const HABITS = 'data/habits'

@scoped(Lifecycle.ContainerScoped)
export default class DbHandler {
  private uid
  public db
  public isWriteComplete = true

  constructor(authUser: AuthUser, @inject('Db') db: Firestore) {
    this.uid = authUser.uid
    this.db = db
    makeAutoObservable(this)
  }

  public getUsernameDoc = async (username: string) => {
    const data = (await getDoc(doc(this.db, USERNAMES, username))).data()
    if (!data) return null
    return data as AvatarAndDisplayName
  }

  public getOwnDoc = async (...pathSegments: string[]) => {
    return (await getDoc(this.ownDocRef(...pathSegments))).data()
  }

  public updateOwnDoc = async (path: string, data: object) => {
    this.isWriteComplete = false
    await setDoc(this.ownDocRef(path), data, { merge: true })
    this.completeWrite()
  }

  public getWeekDoc = async (weekStartDate: string) => {
    const weekDoc = await this.getOwnDoc(WEEKS, weekStartDate) ?? null
    if (weekDoc && !weekDoc.startDate) {
      console.error('The week document is missing a startDate. This is a bug.')
      weekDoc.startDate = weekStartDate
    }
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
    await this.updateOwnDoc(`${WEEKS}/${weekStartDate}`, { startDate: weekStartDate, ...data })
  }

  public getWeekIconsDoc = async (year: string) => {
    const iconsDoc = await this.getOwnDoc(WEEK_ICONS, year) ?? null
    return iconsDoc
  }

  public updateWeekIcon = async (weekStartDate: string, icon: string) => {
    this.isWriteComplete = false
    const { yyyy, mmdd } = separateYYYYfromMMDD(weekStartDate)
    const batch = writeBatch(this.db)
    batch.set(this.ownDocRef(WEEKS, weekStartDate), {
      icon,
      startDate: weekStartDate
    }, { merge: true })
    batch.set(this.ownDocRef(WEEK_ICONS, yyyy), { [mmdd]: icon }, { merge: true })
    await batch.commit()
    this.completeWrite()
  }

  public removeWeekIcon = async (weekStartDate: string) => {
    this.isWriteComplete = false
    const { yyyy, mmdd } = separateYYYYfromMMDD(weekStartDate)
    const batch = writeBatch(this.db)
    batch.set(this.ownDocRef(WEEKS, weekStartDate), {
      icon: deleteField()
    }, { merge: true })
    batch.set(this.ownDocRef(WEEK_ICONS, yyyy), {
      [mmdd]: deleteField()
    }, { merge: true })
    await batch.commit()
    this.completeWrite()
  }

  public getJournalEntryDoc = async (entryId: string) => {
    const entryDoc = await this.getOwnDoc(JOURNAL, entryId) ?? null
    return entryDoc as Fetched<JournalEntryDocumentData>
  }

  public updateJournalEntry = async (entry: JournalEntryDocumentData) => {
    this.isWriteComplete = false
    const batch = writeBatch(this.db)
    batch.set(this.ownDocRef(JOURNAL, entry.id), entry, { merge: true })
    batch.set(this.ownDocRef(WEEKS, entry.weekStartDate), {
      startDate: entry.weekStartDate,
      journalEntries: { [entry.habitId]: arrayUnion(entry.id) },
      journalMetadata: { [entry.id]: { title: entry.title, icon: entry.icon } }
    }, { merge: true })
    await batch.commit()
    this.completeWrite()
  }

  public deleteJournalEntry = async (entry: JournalEntryDocumentData) => {
    this.isWriteComplete = false
    const batch = writeBatch(this.db)
    batch.delete(this.ownDocRef(JOURNAL, entry.id))
    batch.set(this.ownDocRef(WEEKS, entry.weekStartDate), {
      journalEntries: { [entry.habitId]: arrayRemove(entry.id) },
      journalMetadata: { [entry.id]: deleteField() }
    }, { merge: true })
    await batch.commit()
    this.completeWrite()
  }

  public deleteHabit = async (habitId: string) => {
    this.isWriteComplete = false
    const deleteDataPromise = this.updateOwnDoc(HABITS, {
      habits: { [habitId]: deleteField() },
      order: arrayRemove(habitId)
    })
    const deleteJournalEntriesPromise = this.deleteJournalEntriesWithHabitId(habitId)
    await Promise.all([
      deleteDataPromise,
      deleteJournalEntriesPromise
    ])
    this.completeWrite()
  }

  private deleteJournalEntriesWithHabitId = async (habitId: string) => {
    const entryDocs = await getDocs(query(this.journalCollectionRef, where('habitId', '==', habitId)))
    let deleteEntryPromises: Promise<void>[] = []
    entryDocs.forEach((doc) => {
      deleteEntryPromises.push(deleteDoc(doc.ref))
    })
    await Promise.all(deleteEntryPromises)
  }

  private completeWrite = () => {
    this.isWriteComplete = true
  }

  private ownDocRef = (...pathSegments: string[]) => {
    return doc(this.db, USERS, this.uid, ...pathSegments)
  }

  private get weeksCollectionRef() {
    return collection(this.db, USERS, this.uid, WEEKS)
  }

  private get journalCollectionRef() {
    return collection(this.db, USERS, this.uid, JOURNAL)
  }
}