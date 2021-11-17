import type Router from '@/types/router'
import { inject, injectable } from 'tsyringe'
import { makeAutoObservable, runInAction, when } from 'mobx'
import { FirebaseError } from '@firebase/util'
import { formatYYYYMMDD } from '@/logic/utils/dateUtilities'
import generateNoteId from '@/logic/utils/generateNoteId'
import HabitsHandler, { Habit, HabitsDocumentData } from '@/logic/app/HabitsHandler'
import WeekHandler from '@/logic/app/WeekHandler'
import DbHandler from '@/logic/app/DbHandler'
import FriendsHandler from '@/logic/app/FriendsHandler'
import FriendActivityHandler from '@/logic/app/FriendActivityHandler'

export type NotePageQueryParams = {
  id: string,
  habitId?: string,
  user?: string
}

export type NoteDocumentData = {
  id: string,
  title: string,
  icon: string,
  habitId: string,
  date: string,
  weekStartDate: string,
  content: string
}

@injectable()
export default class NoteEditor {
  public note?: NoteDocumentData = undefined
  public habit?: Habit
  public allowEditing = false
  public isEditing = false
  public isNewNote = false
  public hasUnsavedChanges = false
  public isSaving = false
  private router
  private weekHandler
  private habitsHandler
  private dbHandler
  private friendsHandler
  private friendActivityHandler

  constructor(
    weekHandler: WeekHandler,
    habitsHandler: HabitsHandler,
    dbHandler: DbHandler,
    friendsHandler: FriendsHandler,
    friendActivityHandler: FriendActivityHandler,
    @inject('Router') router: Router
  ) {
    this.router = router
    this.weekHandler = weekHandler
    this.habitsHandler = habitsHandler
    this.dbHandler = dbHandler
    this.friendsHandler = friendsHandler
    this.friendActivityHandler = friendActivityHandler

    const query = router.query as NotePageQueryParams
    if (query.id) {
      this.loadNote(query.id, query.user)
    } else {
      this.initializeNewNote(query.habitId)
    }
    makeAutoObservable(this)
  }

  public startEditing = () => {
    this.isEditing = true
  }

  public updateNote = (property: 'icon' | 'title' | 'content', value: string) => {
    if (!this.note) return
    this.note[property] = value
    this.hasUnsavedChanges = true
  }

  public finishEditing = async () => {
    this.isEditing = false
    await this.saveChanges()
  }

  public saveChanges = async () => {
    if (!this.note) return
    if (!this.isNewNote && !this.hasUnsavedChanges) return

    const replaceUrl = this.isNewNote
    this.note.title = this.note.title || 'Untitled note'
    this.hasUnsavedChanges = false
    this.isSaving = true

    this.isNewNote = false

    // 💻
    if (this.weekHandler.weekInView.data.startDate === this.note.weekStartDate) {
      this.weekHandler.weekInView.setNoteLocally(this.note.habitId, this.note.id, {
        icon: this.note.icon,
        title: this.note.title
      })
    }

    // ☁️️
    await this.dbHandler.updateNote(this.note)

    runInAction(() => { this.isSaving = false })

    if (replaceUrl && this.router.route.includes('note')) {
      this.router.replace(`/note?id=${this.note.id}`, undefined, { shallow: true })
    }
  }

  public deleteNote = async () => {
    if (!this.note) return
    this.hasUnsavedChanges = false
    this.weekHandler.weekInView.clearNoteLocally(this.note.habitId, this.note.id)
    this.router.push('/home')
    if (!this.isNewNote) {
      await this.dbHandler.deleteNote(this.note)
    }
  }

  private initializeNewNote = (habitId?: string) => {
    const habit = this.habitsHandler.habits.find((habit) => habit.id === habitId)
    if (!habit || !habitId) {
      this.router.push('/home')
      return
    }
    this.isNewNote = true
    this.allowEditing = true
    this.note = {
      id: generateNoteId(),
      title: '',
      icon: '📝',
      habitId: habitId,
      date: formatYYYYMMDD(new Date()),
      weekStartDate: this.weekHandler.weekInView.data.startDate,
      content: ''
    }
  }

  private loadNote = async (noteId: string, friendUsername?: string) => {
    await when(() => this.dbHandler.isWriteComplete)
    await when(() => this.friendsHandler.hasLoadedFriends)

    //? attempting to access a private note will result in a Firebase permission denied error.
    try {
      const friendUid =
        friendUsername
          ? this.getFriendUidByUsername(friendUsername)
          : undefined

      const noteData = await this.dbHandler.getNoteDoc(noteId, friendUid)
      if (!noteData) throw new Error('Note data not found.')

      this.habit =
        friendUid
          ? await this.getHabitOfFriend(friendUid, noteData.habitId)
          : this.habitsHandler.habits.find((habit) => habit.id === noteData.habitId)

      runInAction(() => {
        this.note = noteData
        if (!friendUsername) this.allowEditing = true
      })

      return

    } catch (err) {
      console.error(err instanceof FirebaseError ? 'Permission denied.' : err)
    }

    this.router.push('/home')
  }

  private getHabitOfFriend = async (friendUid: string, habitId: string): Promise<Habit> => {
    const notFoundError = 'Could not find habit associated with this note.'

    const habitsDocListener =
      this.friendActivityHandler.habitsDocListeners.find((listener) => listener.friendUid === friendUid)

    if (habitsDocListener) {
      const habit = habitsDocListener.habits.find((habit) => habit.id === habitId)
      if (!habit) throw new Error(notFoundError)
      return habit
    }

    const habitsDoc = await this.dbHandler
      .getDocData(this.dbHandler.habitsDocRef(friendUid)) as HabitsDocumentData | undefined

    const habitProperties = habitsDoc?.habits?.[habitId]
    if (!habitProperties) throw new Error(notFoundError)

    return { ...habitProperties, id: habitId }
  }

  private getFriendUidByUsername = (username: string) => {
    const uid = this.friendsHandler.friends.find((friend) => friend.username === username)?.uid
    if (!uid) {
      throw new Error(`Friend with username ${username} not found.`)
    }
    return uid
  }
}