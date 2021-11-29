import type Router from '@/types/router'
import { inject, injectable } from 'tsyringe'
import { makeAutoObservable, runInAction, when } from 'mobx'
import { FirebaseError } from '@firebase/util'
import { formatYYYYMMDD } from '@/logic/utils/dateUtilities'
import ProfileHandler, { AvatarAndDisplayName } from '@/logic/app/ProfileHandler'
import HabitsHandler, { Habit } from '@/logic/app/HabitsHandler'
import FriendsHandler, { Friend } from '@/logic/app/FriendsHandler'
import DbHandler from '@/logic/app/DbHandler'
import generateNoteId from '@/logic/utils/generateNoteId'

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
  content: string
}

@injectable()
export default class NoteEditor {
  public note?: NoteDocumentData = undefined
  public habit?: Habit = undefined
  public userInfo?: AvatarAndDisplayName = undefined
  public allowEditing = false
  public isEditing = false
  public isNewNote = false
  public hasUnsavedChanges = false
  public isSaving = false

  constructor(
    private habitsHandler: HabitsHandler,
    private dbHandler: DbHandler,
    private profileHandler: ProfileHandler,
    private friendsHandler: FriendsHandler,
    @inject('Router') private router: Router
  ) {
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

    console.error('saveChanges changes not fully implemented')

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
    this.router.push('/home')
    if (!this.isNewNote) {
      await this.dbHandler.deleteNote(this.note)
    }
  }

  private initializeNewNote = (habitId?: string) => {
    const habit = habitId ? this.habitsHandler.findHabitById(habitId) : null
    if (!habit || !habitId) {
      this.router.push('/home')
      return
    }
    this.isNewNote = true
    this.allowEditing = true
    this.habit = habit
    this.userInfo = this.getAvatarAndDisplayName()
    this.note = {
      id: generateNoteId(),
      title: '',
      icon: '📝',
      habitId: habitId,
      date: formatYYYYMMDD(new Date()),
      content: ''
    }
  }

  private loadNote = async (noteId: string, friendUsername?: string) => {
    await when(() => this.dbHandler.isWriteComplete)
    await when(() => this.friendsHandler.hasLoadedFriends)

    //? attempting to access a private note will result in a Firebase permission denied error.
    try {
      const friend = friendUsername ? this.getFriendByUsername(friendUsername) : null

      const noteData = await this.dbHandler.getNoteDoc(noteId, friend?.uid)
      if (!noteData) throw new Error('Note data not found.')

      this.habit =
        friend
          ? await this.getHabitOfFriend(friend.uid, noteData.habitId)
          : this.habitsHandler.findHabitById(noteData.habitId)

      this.userInfo = this.getAvatarAndDisplayName(friend)

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

  private getHabitOfFriend = async (friendUid: string, habitId: string) => {
    console.error('getHabitOfFriend not implemented')
    return undefined
  }

  private getFriendByUsername = (username: string) => {
    const friend = this.friendsHandler.friends.find((friend) => friend.username === username)
    if (!friend) {
      throw new Error(`Friend with username ${username} not found.`)
    }
    return friend
  }

  private getAvatarAndDisplayName = (friend?: Friend | null) => {
    return friend ?? {
      avatar: this.profileHandler.profileInfo?.avatar ?? '🙂',
      displayName: 'You'
    }
  }
}