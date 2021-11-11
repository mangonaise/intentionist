import type { Firestore, DocumentReference, DocumentData } from '@firebase/firestore'
import type { Fetched } from '@/logic/app/InitialFetchHandler'
import type { WeekDocumentData } from '@/logic/app/WeekHandler'
import type { NoteDocumentData as NoteDocumentData } from '@/logic/app/NoteEditor'
import type { AvatarAndDisplayName } from '@/logic/app/ProfileHandler'
import { inject, singleton } from 'tsyringe'
import { makeAutoObservable } from 'mobx'
import { collection, doc, getDoc, getDocs, query, setDoc, limit, orderBy, writeBatch, arrayUnion, arrayRemove, deleteField, where, deleteDoc } from '@firebase/firestore'
import { separateYYYYfromMMDD } from '@/logic/utils/dateUtilities'
import AuthUser from '@/logic/app/AuthUser'

const USERS = 'users'
const USERNAMES = 'usernames'
const WEEKS = 'weeks'
const WEEK_ICONS = 'weekIcons'
const NOTES = 'notes'
const FRIEND_REQUESTS = 'data/friendRequests'
const FRIENDS = 'data/friends'
const HABITS = 'data/habits'

@singleton()
export default class DbHandler {
  private uid
  public db
  public isWriteComplete = true

  constructor(authUser: AuthUser, @inject('Firestore') db: Firestore) {
    this.uid = authUser.uid
    this.db = db
    makeAutoObservable(this)
  }

  public getDocData = async (docRef: DocumentReference<DocumentData>) => {
    return (await getDoc(docRef)).data()
  }

  public update = async (docRef: DocumentReference<DocumentData>, data: object) => {
    this.isWriteComplete = false
    await setDoc(docRef, data, { merge: true })
    this.completeWrite()
  }

  public getUsernameDoc = async (username: string) => {
    const data = await this.getDocData(doc(this.db, USERNAMES, username))
    if (!data) return null
    return data as AvatarAndDisplayName
  }

  public getWeekDoc = async (weekStartDate: string) => {
    const weekDoc = await this.getDocData(this.weekDocRef(weekStartDate)) ?? null
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
    await this.update(this.weekDocRef(weekStartDate), { startDate: weekStartDate, ...data })
  }

  public getWeekIconsDoc = async (year: string) => {
    const iconsDoc = await this.getDocData(this.weekIconsDocRef(year)) ?? null
    return iconsDoc
  }

  public updateWeekIcon = async (weekStartDate: string, icon: string) => {
    this.isWriteComplete = false
    const { yyyy, mmdd } = separateYYYYfromMMDD(weekStartDate)
    const batch = writeBatch(this.db)
    batch.set(this.weekDocRef(weekStartDate), {
      icon,
      startDate: weekStartDate
    }, { merge: true })
    batch.set(this.weekIconsDocRef(yyyy), { [mmdd]: icon }, { merge: true })
    await batch.commit()
    this.completeWrite()
  }

  public removeWeekIcon = async (weekStartDate: string) => {
    this.isWriteComplete = false
    const { yyyy, mmdd } = separateYYYYfromMMDD(weekStartDate)
    const batch = writeBatch(this.db)
    batch.set(this.weekDocRef(weekStartDate), {
      icon: deleteField()
    }, { merge: true })
    batch.set(this.weekIconsDocRef(yyyy), {
      [mmdd]: deleteField()
    }, { merge: true })
    await batch.commit()
    this.completeWrite()
  }

  public getNoteDoc = async (noteId: string) => {
    const noteDoc = await this.getDocData(this.noteDocRef(noteId)) ?? null
    return noteDoc as Fetched<NoteDocumentData>
  }

  public updateNote = async (note: NoteDocumentData) => {
    this.isWriteComplete = false
    const batch = writeBatch(this.db)
    batch.set(this.noteDocRef(note.id), note, { merge: true })
    batch.set(this.weekDocRef(note.weekStartDate), {
      startDate: note.weekStartDate,
      notes: { [note.habitId]: arrayUnion(note.id) },
      notesMetadata: { [note.id]: { title: note.title, icon: note.icon } }
    }, { merge: true })
    await batch.commit()
    this.completeWrite()
  }

  public deleteNote = async (note: NoteDocumentData) => {
    this.isWriteComplete = false
    const batch = writeBatch(this.db)
    batch.delete(this.noteDocRef(note.id))
    batch.set(this.weekDocRef(note.weekStartDate), {
      notes: { [note.habitId]: arrayRemove(note.id) },
      notesMetadata: { [note.id]: deleteField() }
    }, { merge: true })
    await batch.commit()
    this.completeWrite()
  }

  public deleteHabit = async (habitId: string) => {
    this.isWriteComplete = false
    const deleteHabitDataPromise = this.update(this.habitsDocRef, {
      habits: { [habitId]: deleteField() },
      order: arrayRemove(habitId)
    })
    const deleteNotesPromise = this.deleteNotesWithHabitId(habitId)
    await Promise.all([
      deleteHabitDataPromise,
      deleteNotesPromise
    ])
    this.completeWrite()
  }

  public userDocRef = (path?: string, uid?: string) => {
    return doc(this.db, USERS, uid ?? this.uid, path ?? '')
  }

  public get habitsDocRef() {
    return this.userDocRef(HABITS)
  }

  public get friendRequestsDocRef() {
    return this.userDocRef(FRIEND_REQUESTS)
  }

  public get friendsDocRef() {
    return this.userDocRef(FRIENDS)
  }

  public weekDocRef = (weekStartDate: string) => {
    return this.userDocRef(WEEKS + '/' + weekStartDate)
  }

  public weekIconsDocRef = (year: string) => {
    return this.userDocRef(WEEK_ICONS + '/' + year)
  }

  public noteDocRef = (noteId: string) => {
    return this.userDocRef(NOTES + '/' + noteId)
  }

  public get weeksCollectionRef() {
    return collection(this.db, USERS, this.uid, WEEKS)
  }

  public get notesCollectionRef() {
    return collection(this.db, USERS, this.uid, NOTES)
  }

  // TODO: Move to cloud function
  private deleteNotesWithHabitId = async (habitId: string) => {
    const noteDocs = await getDocs(query(this.notesCollectionRef, where('habitId', '==', habitId)))
    let deleteNotePromises: Promise<void>[] = []
    noteDocs.forEach((doc) => {
      deleteNotePromises.push(deleteDoc(doc.ref))
    })
    await Promise.all(deleteNotePromises)
  }

  private completeWrite = () => {
    this.isWriteComplete = true
  }
}