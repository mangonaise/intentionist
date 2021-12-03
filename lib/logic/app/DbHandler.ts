import type { Firestore, DocumentReference, DocumentData } from '@firebase/firestore'
import type { AvatarAndDisplayName } from '@/logic/app/ProfileHandler'
import { inject, singleton } from 'tsyringe'
import { makeAutoObservable } from 'mobx'
import { collection, doc, getDoc, getDocs, query, setDoc, arrayUnion, arrayRemove, writeBatch, where, deleteDoc, deleteField } from '@firebase/firestore'
import { Habit, HabitVisibility } from '@/logic/app/HabitsHandler'
import AuthUser from '@/logic/app/AuthUser'

const USERS = 'users'
const USERNAMES = 'usernames'
const HABITS = 'habits'
const HABIT_DETAILS = 'userData/habitDetails'
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

  public getActiveHabitsDocs = async (friendUid?: string) => {
    const docs = await getDocs(query(this.habitsCollectionRef(friendUid), where('archived', '==', false)))
    let habits = [] as Habit[]
    docs.forEach((doc) => {
      habits.push(doc.data() as Habit)
    })
    return habits
  }

  public getHabitDetailsDoc = async (friendUid?: string) => {
    return await this.getDocData(this.habitDetailsDocRef(friendUid))
  }

  public addHabit = async (habit: Habit) => {
    this.isWriteComplete = false
    const batch = writeBatch(this.db)

    batch.set(this.habitDocRef(habit.id), habit, { merge: true })
    batch.set(this.habitDetailsDocRef(), {
      order: arrayUnion(habit.id),
      activeIds: {
        private: {
          [habit.id]: true
        }
      }
    }, { merge: true })

    await batch.commit()
    this.completeWrite()
  }

  public changeHabitVisibility = async (habit: Habit, visibility: HabitVisibility) => {
    this.isWriteComplete = false
    const batch = writeBatch(this.db)

    batch.set(this.habitDocRef(habit.id), { visibility }, { merge: true })
    batch.set(this.habitDetailsDocRef(), {
      activeIds: {
        public: {
          [habit.id]: visibility === 'public' ? true : deleteField()
        },
        private: {
          [habit.id]: visibility === 'private' ? true : deleteField()
        }
      }
    }, { merge: true })

    await batch.commit()
    this.completeWrite()
  }

  public deleteHabit = async (habitId: string, linkedHabitIds: string[]) => {
    this.isWriteComplete = false

    let linked = {} as { [friendHabitId: string]: any }
    linkedHabitIds.forEach((id) => linked[id] = deleteField())

    const batch = writeBatch(this.db)
    batch.delete(this.habitDocRef(habitId))
    batch.set(this.habitDetailsDocRef(), {
      activeIds: {
        public: { [habitId]: deleteField() },
        private: { [habitId]: deleteField() }
      },
      order: arrayRemove(habitId),
      linked
    }, { merge: true })
    await batch.commit()

    this.completeWrite()
  }

  public addLinkedHabit = async (args: { friendHabitId: string, friendUid: string, linkedHabitId: string }) => {
    const { friendHabitId, friendUid, linkedHabitId } = args
    await this.update(this.habitDetailsDocRef(), {
      linked: {
        [friendHabitId]: { friendUid, linkedHabitId, time: Date.now() }
      }
    })
  }

  public removeLinkedHabit = async (friendHabitId: string) => {
    await this.update(this.habitDetailsDocRef(), {
      linked: {
        [friendHabitId]: deleteField()
      }
    })
  }

  public userDocRef = (path?: string, options?: { friendUid?: string }) => {
    return doc(this.db, USERS, options?.friendUid ?? this.uid, path ?? '')
  }

  public get friendRequestsDocRef() {
    return this.userDocRef(FRIEND_REQUESTS)
  }

  public get friendsDocRef() {
    return this.userDocRef(FRIENDS)
  }

  public habitDetailsDocRef(friendUid?: string) {
    return this.userDocRef(HABIT_DETAILS, { friendUid })
  }

  public habitsCollectionRef(friendUid?: string) {
    return collection(this.db, USERS, friendUid ?? this.uid, HABITS)
  }

  public habitDocRef(habitId: string, options?: { friendUid?: string }) {
    return this.userDocRef(HABITS + '/' + habitId, { friendUid: options?.friendUid })
  }

  private completeWrite = () => {
    this.isWriteComplete = true
  }
}