import '@abraham/reflection'
import { container } from 'tsyringe'
import { when } from 'mobx'
import { deleteApp } from '@firebase/app'
import { formatYYYYMMDD } from '@/lib/logic/utils/dateUtilities'
import initializeFirebase, { registerFirebaseInjectionTokens } from '@/lib/firebase'
import generateJournalEntryId from '@/lib/logic/utils/generateJournalEntryId'
import generateHabitId from '@/lib/logic/utils/generateHabitId'
import HabitsHandler, { Habit } from '@/lib/logic/app/HabitsHandler'
import JournalEntryEditor, { JournalEntryDocumentData } from '@/lib/logic/app/JournalEntryEditor'
import WeekHandler from '@/lib/logic/app/WeekHandler'
import DbHandler from '@/lib/logic/app/DbHandler'
import MockRouter from '@/test-setup/mock/MockRouter'
import signInDummyUser from '@/test-setup/signInDummyUser'
import deleteHabitsDoc from '@/test-setup/deleteHabitsDoc'
import simulateInitialFetches from '@/test-setup/simulateInitialFetches'
import deleteJournalEntries from '@/test-setup/deleteJournalEntries'
import deleteWeeks from '@/test-setup/deleteWeeks'

// 🔨

const { firebaseApp, auth, db } = initializeFirebase('test-journalentryeditor')

let journalEntryEditor: JournalEntryEditor, weekHandler: WeekHandler, dbHandler: DbHandler
let router: MockRouter

const dummyHabit: Habit = { id: generateHabitId(), name: 'Journal editor test habit A', icon: '✏️', status: 'active' }
const dummyWeekStartDate = '2021-09-27'
const dummyJournalEntryA: JournalEntryDocumentData = {
  id: generateJournalEntryId(),
  title: 'Dummy journal entry',
  icon: '🧪',
  content: 'Some cool content',
  habitId: dummyHabit.id,
  date: '2021-09-30',
  weekStartDate: dummyWeekStartDate
}
const dummyJournalEntryB: JournalEntryDocumentData = {
  id: generateJournalEntryId(),
  title: 'Another dummy journal entry',
  icon: '🔬',
  content: 'Some awesome content',
  habitId: dummyHabit.id,
  date: '2021-09-29',
  weekStartDate: dummyWeekStartDate
}

beforeAll(async () => {
  await signInDummyUser()
})

beforeEach(async () => {
  registerFirebaseInjectionTokens({ auth, db })
  await simulateInitialFetches(container)
  const habitsHandler = container.resolve(HabitsHandler)
  habitsHandler.setHabit(dummyHabit)
  dbHandler = container.resolve(DbHandler)
  weekHandler = container.resolve(WeekHandler)
  router = container.resolve(MockRouter)
  container.register('Router', { useValue: router })
})

afterEach(async () => {
  await deleteHabitsDoc()
  await deleteJournalEntries()
  await deleteWeeks()
  container.clearInstances()
})

afterAll(async () => {
  await deleteApp(firebaseApp)
})

function startJournalEntryEditor() {
  journalEntryEditor = container.resolve(JournalEntryEditor)
}

// 🧪

describe('initialization', () => {
  test(`if router query id is "new" and habitId is supplied, instantly generates empty journal entry using the week in view's start date, with isNewEntry set to true`, () => {
    router.setQuery({ id: 'new', habitId: dummyHabit.id })
    startJournalEntryEditor()
    expect(journalEntryEditor.isNewEntry).toEqual(true)
    expect(journalEntryEditor.entry).toEqual({
      title: '',
      icon: '📖',
      content: '',
      habitId: dummyHabit.id,
      date: formatYYYYMMDD(new Date()),
      weekStartDate: weekHandler.weekInView.startDate,
      id: journalEntryEditor.entry?.id
    })
  })

  test('if router query id is an existing journal entry id, loads the correct entry data from the database, with isNewEntry set to false', async () => {
    await dbHandler.updateJournalEntry(dummyJournalEntryA)
    router.setQuery({ id: dummyJournalEntryA.id })
    startJournalEntryEditor()
    await when(() => !!journalEntryEditor.entry)
    expect(journalEntryEditor.isNewEntry).toEqual(false)
    expect(journalEntryEditor.entry).toEqual(dummyJournalEntryA)
  })

  test(`if trying to generate an empty journal entry but habitId does not correspond to any of the user's habits, routes back home`, () => {
    router.setQuery({ id: 'new', habitId: 'abc' })
    startJournalEntryEditor()
    expect(router.push).toHaveBeenCalledWith('/home')
  })

  test('if trying to generate an empty journal entry but no habitId is supplied, routes back home', () => {
    router.setQuery({ id: 'new' })
    startJournalEntryEditor()
    expect(router.push).toHaveBeenCalledWith('/home')
  })
})

describe('behavior', () => {
  test('calling startEditing() sets isEditing to true', () => {
    router.setQuery({ id: 'new', habitId: dummyHabit.id })
    startJournalEntryEditor()
    journalEntryEditor.startEditing()
    expect(journalEntryEditor.isEditing).toEqual(true)
  })

  test('calling finishEditing() sets isEditing to false', () => {
    router.setQuery({ id: 'new', habitId: dummyHabit.id })
    startJournalEntryEditor()
    journalEntryEditor.startEditing()
    journalEntryEditor.finishEditing()
    expect(journalEntryEditor.isEditing).toEqual(false)
  })

  test('the entry title, icon and content can be updated', () => {
    router.setQuery({ id: 'new', habitId: dummyHabit.id })
    startJournalEntryEditor()
    journalEntryEditor.updateEntry('icon', '😎')
    journalEntryEditor.updateEntry('title', 'Updated title')
    journalEntryEditor.updateEntry('content', 'Some content')
    expect(journalEntryEditor.entry).toHaveProperty('icon', '😎')
    expect(journalEntryEditor.entry).toHaveProperty('title', 'Updated title')
    expect(journalEntryEditor.entry).toHaveProperty('content', 'Some content')
  })

  test('finishing editing updates local journal metadata if the journal entry is in the week in view', () => {
    // The above condition is true for new entries. See first test.
    router.setQuery({ id: 'new', habitId: dummyHabit.id })
    startJournalEntryEditor()
    journalEntryEditor.updateEntry('title', 'Hello!')
    journalEntryEditor.updateEntry('icon', '🌟')
    journalEntryEditor.finishEditing()
    const entry = journalEntryEditor.entry!
    expect(weekHandler.weekInView.journalEntries).toEqual({ [dummyHabit.id]: [entry.id] })
    expect(weekHandler.weekInView.journalMetadata?.[entry.id]).toEqual({
      title: 'Hello!',
      icon: '🌟'
    })
  })

  test('saving first changes on a new entry sets isNewEntry to false', () => {
    router.setQuery({ id: 'new', habitId: dummyHabit.id })
    startJournalEntryEditor()
    journalEntryEditor.finishEditing()
    expect(journalEntryEditor.isNewEntry).toEqual(false)
  })

  test('finishing editing does not update local journal metadata if the journal entry is not in the week in view', async () => {
    await dbHandler.updateJournalEntry(dummyJournalEntryA)
    router.setQuery({ id: dummyJournalEntryA.id })
    startJournalEntryEditor()
    journalEntryEditor.updateEntry('title', 'A fresh new title')
    journalEntryEditor.finishEditing()
    expect(weekHandler.weekInView.journalEntries).toBeUndefined()
    expect(weekHandler.weekInView.journalMetadata).toBeUndefined()
  })

  test('if editing completes but the entry title is empty, it is automatically set to "Untitled"', () => {
    router.setQuery({ id: 'new', habitId: dummyHabit.id })
    startJournalEntryEditor()
    journalEntryEditor.startEditing()
    journalEntryEditor.finishEditing()
    expect(journalEntryEditor.entry?.title).toEqual('Untitled')
  })

  test('finishing editing updates the corresponding journal entry document in the database', async () => {
    router.setQuery({ id: 'new', habitId: dummyHabit.id })
    startJournalEntryEditor()
    journalEntryEditor.updateEntry('title', 'Hello world!')
    journalEntryEditor.updateEntry('icon', '🌟')
    journalEntryEditor.updateEntry('content', 'Some content')
    await journalEntryEditor.finishEditing()
    const entryDoc = await dbHandler.getJournalEntryDoc(journalEntryEditor.entry!.id)
    expect(entryDoc).toEqual(journalEntryEditor.entry)
  })

  test('finishing editing updates the metadata in the corresponding week document', async () => {
    await dbHandler.updateJournalEntry(dummyJournalEntryA)
    await dbHandler.updateJournalEntry(dummyJournalEntryB)

    router.setQuery({ id: dummyJournalEntryA.id })
    startJournalEntryEditor()
    await when(() => !!journalEntryEditor.entry)
    journalEntryEditor.updateEntry('title', 'A cool new title')
    journalEntryEditor.updateEntry('icon', '😎')
    await journalEntryEditor.finishEditing()

    router.setQuery({ id: dummyJournalEntryB.id })
    startJournalEntryEditor()
    await when(() => !!journalEntryEditor.entry)
    journalEntryEditor.updateEntry('title', 'Another awesome title')
    journalEntryEditor.updateEntry('icon', '⭐')
    await journalEntryEditor.finishEditing()

    const weekDoc = await dbHandler.getWeekDoc(dummyWeekStartDate)
    expect(weekDoc?.journalEntries).toEqual({
      [dummyHabit.id]: [dummyJournalEntryA.id, dummyJournalEntryB.id]
    })
    expect(weekDoc?.journalMetadata).toEqual({
      [dummyJournalEntryA.id]: {
        title: 'A cool new title',
        icon: '😎'
      },
      [dummyJournalEntryB.id]: {
        title: 'Another awesome title',
        icon: '⭐'
      }
    })
  })

  test('creating a journal entry sets the startDate field in the corresponding week document', async () => {
    router.setQuery({ id: 'new', habitId: dummyHabit.id })
    startJournalEntryEditor()
    await journalEntryEditor.finishEditing()
    const weekDoc = await dbHandler.getWeekDoc(journalEntryEditor.entry!.weekStartDate)
    expect(weekDoc?.startDate).toEqual(journalEntryEditor.entry!.weekStartDate)
  })

  test('deleting an entry removes the corresponding journal entry document from the database', async () => {
    await dbHandler.updateJournalEntry(dummyJournalEntryA)
    router.setQuery({ id: dummyJournalEntryA.id })
    startJournalEntryEditor()
    await when(() => !!journalEntryEditor.entry)
    await journalEntryEditor.deleteEntry()
    const entryDoc = await dbHandler.getJournalEntryDoc(dummyJournalEntryA.id)
    expect(entryDoc).toBeNull()
  })

  test('deleting an entry removes the metadata from the corresponding week document', async () => {
    await dbHandler.updateJournalEntry(dummyJournalEntryA)

    router.setQuery({ id: dummyJournalEntryA.id })
    startJournalEntryEditor()
    await when(() => !!journalEntryEditor.entry)
    await journalEntryEditor.deleteEntry()

    const weekDoc = await dbHandler.getWeekDoc(dummyJournalEntryA.weekStartDate)
    expect(weekDoc?.journalEntries?.[dummyJournalEntryA.habitId]?.includes(dummyJournalEntryA.id)).toEqual(false)
    expect(weekDoc?.journalMetadata?.[dummyJournalEntryA.id]).toBeUndefined()
  })

  test('deleting an entry of the week in view clears the metadata from the local cache', async () => {
    await dbHandler.updateJournalEntry(dummyJournalEntryA)
    await dbHandler.updateJournalEntry(dummyJournalEntryB)

    await weekHandler.viewWeek(dummyWeekStartDate)

    router.setQuery({ id: dummyJournalEntryB.id })
    startJournalEntryEditor()
    await when(() => !!journalEntryEditor.entry)
    await journalEntryEditor.deleteEntry()

    const weekInView = weekHandler.weekInView
    expect(weekInView.journalEntries?.[dummyJournalEntryB.habitId]?.includes(dummyJournalEntryB.id)).toEqual(false)
    expect(weekInView.journalMetadata?.[dummyJournalEntryB.id]).toBeUndefined()
  })
})