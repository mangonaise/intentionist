import type { Firestore, DocumentReference, DocumentData } from '@firebase/firestore'
import type { Fetched } from '@/logic/app/InitialFetchHandler'
import type { NoteDocumentData } from '@/logic/app/NoteEditor'
import type { AvatarAndDisplayName } from '@/logic/app/ProfileHandler'
import { inject, singleton } from 'tsyringe'
import { makeAutoObservable } from 'mobx'
import { collection, doc, getDoc, getDocs, query, setDoc, limit, orderBy, writeBatch, arrayUnion, arrayRemove, deleteField, where, deleteDoc } from '@firebase/firestore'
import AuthUser from '@/logic/app/AuthUser'

const USERS = 'users'
const USERNAMES = 'usernames'
const HABITS = 'habits'
const HABIT_DETAILS = 'userData/habitDetails'
const NOTES = 'notes'
const FRIEND_REQUESTS = 'userData/friendRequests'
const FRIENDS = 'userData/friends'

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

  public getNoteDoc = async (noteId: string, friendUid?: string) => {
    const noteDoc = await this.getDocData(this.noteDocRef(noteId, friendUid)) ?? null
    return noteDoc as Fetched<NoteDocumentData>
  }

  public updateNote = async (note: NoteDocumentData) => {
    this.isWriteComplete = false
    await setDoc(this.noteDocRef(note.id), note, { merge: true })
    this.completeWrite()
  }

  public deleteNote = async (note: NoteDocumentData) => {
    this.isWriteComplete = false
    await deleteDoc(this.noteDocRef(note.id))
    this.completeWrite()
  }

  public deleteHabit = async (habitId: string) => {
    this.isWriteComplete = false
    const deleteHabitPromise = () => deleteDoc(this.habitDocRef(habitId))
    console.warn('Updating habit details not implemented')
    const deleteNotesPromise = () => this.deleteNotesWithHabitId(habitId)
    await Promise.all([
      deleteHabitPromise(),
      deleteNotesPromise()
    ])
    this.completeWrite()
  }

  public userDocRef = (path?: string, friendUid?: string) => {
    return doc(this.db, USERS, friendUid ?? this.uid, path ?? '')
  }

  public get friendRequestsDocRef() {
    return this.userDocRef(FRIEND_REQUESTS)
  }

  public get friendsDocRef() {
    return this.userDocRef(FRIENDS)
  }

  public habitDocRef(habitId: string) {
    return this.userDocRef(HABITS, habitId)
  }

  public noteDocRef = (noteId: string, friendUid?: string) => {
    return this.userDocRef(NOTES + '/' + noteId, friendUid)
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