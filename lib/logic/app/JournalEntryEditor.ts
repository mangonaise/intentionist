import type Router from '../types/router'
import { inject, injectable } from 'tsyringe'
import { makeAutoObservable, runInAction, when } from 'mobx'
import { formatYYYYMMDD } from '../utils/dateUtilities'
import generateJournalEntryId from '../utils/generateJournalEntryId'
import HabitsHandler from './HabitsHandler'
import WeekHandler from './WeekHandler'
import DbHandler from './DbHandler'

type QueryParams = {
  id: string,
  habitId?: string
}

export type JournalEntryDocumentData = {
  id: string,
  title: string,
  icon: string,
  habitId: string,
  date: string,
  weekStartDate: string,
  content: string
}

@injectable()
export default class JournalEntryEditor {
  public entry?: JournalEntryDocumentData = undefined
  public isEditing = false
  public isNewEntry = false
  public hasUnsavedChanges = false
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
    if (query.id === 'new') {
      this.initializeNewEntry(query.habitId)
    } else {
      this.loadEntry(query.id)
    }
    makeAutoObservable(this)
  }

  public startEditing = () => {
    this.isEditing = true
  }

  public updateEntry = (property: 'icon' | 'title' | 'content', value: string) => {
    if (!this.entry) return
    this.entry[property] = value
    this.hasUnsavedChanges = true
  }

  public finishEditing = async () => {
    if (!this.entry) return
    this.entry.title = this.entry.title || 'Untitled'

    const replaceUrl = this.isNewEntry
    this.isEditing = false
    this.hasUnsavedChanges = false
    this.isNewEntry = false

    // 💻
    if (this.weekHandler.weekInView.startDate === this.entry.weekStartDate) {
      this.weekHandler.setJournalEntryLocally(this.entry.habitId, this.entry.id, {
        icon: this.entry.icon,
        title: this.entry.title
      })
    }

    // ☁️️
    await this.dbHandler.updateJournalEntry(this.entry)

    if (replaceUrl && this.router.route.includes('journal')) {
      this.router.replace(`/journal/${this.entry.id}`, undefined, { shallow: true })
    }
  }

  public deleteEntry = async () => {
    if (!this.entry) return
    this.weekHandler.clearJournalEntryLocally(this.entry.habitId, this.entry.id)
    this.router.push('/home')
    if (!this.isNewEntry) {
      await this.dbHandler.deleteJournalEntry(this.entry)
    }
  }

  private initializeNewEntry = (habitId?: string) => {
    const habit = this.habitsHandler.habits.find((habit) => habit.id === habitId)
    if (!habit || !habitId) {
      this.router.push('/home')
      return
    }
    this.isNewEntry = true
    this.entry = {
      id: generateJournalEntryId(),
      title: '',
      icon: '📖',
      habitId: habitId,
      date: formatYYYYMMDD(new Date()),
      weekStartDate: this.weekHandler.weekInView.startDate,
      content: ''
    }
  }

  private loadEntry = async (entryId: string) => {
    await when(() => this.dbHandler.isWriteComplete)
    const entryData = await this.dbHandler.getJournalEntryDoc(entryId)
    if (entryData) {
      runInAction(() => {
        this.entry = entryData
      })
    } else {
      this.router.push('/home')
    }
  }
}