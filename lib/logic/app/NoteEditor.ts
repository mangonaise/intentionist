import type Router from '@/types/router'
import { inject, injectable } from 'tsyringe'
import { makeAutoObservable, runInAction, when } from 'mobx'
import { formatYYYYMMDD } from '@/logic/utils/dateUtilities'
import generateNoteId from '@/logic/utils/generateNoteId'
import HabitsHandler from '@/logic/app/HabitsHandler'
import WeekHandler from '@/logic/app/WeekHandler'
import DbHandler from '@/logic/app/DbHandler'

type QueryParams = {
  id: string,
  habitId?: string
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
  public isEditing = false
  public isNewNote = false
  public hasUnsavedChanges = false
  public isSaving = false
  private router
  private weekHandler
  private habitsHandler
  private dbHandler

  constructor(weekHandler: WeekHandler, habitsHandler: HabitsHandler, dbHandler: DbHandler, @inject('Router') router: Router) {
    this.router = router
    this.weekHandler = weekHandler
    this.habitsHandler = habitsHandler
    this.dbHandler = dbHandler
    const query = router.query as QueryParams
    if (query.id) {
      this.loadNote(query.id)
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

  private loadNote = async (noteId: string) => {
    await when(() => this.dbHandler.isWriteComplete)
    const noteData = await this.dbHandler.getNoteDoc(noteId)
    if (noteData) {
      runInAction(() => {
        this.note = noteData
      })
    } else {
      this.router.push('/home')
    }
  }
}