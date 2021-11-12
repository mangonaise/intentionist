import '@abraham/reflection'
import { container } from 'tsyringe'
import { when } from 'mobx'
import { formatYYYYMMDD } from '@/logic/utils/dateUtilities'
import initializeFirebase, { registerFirebaseInjectionTokens } from '@/firebase-setup/initializeFirebase'
import generateNoteId from '@/logic/utils/generateNoteId'
import generateHabitId from '@/logic/utils/generateHabitId'
import HabitsHandler, { Habit } from '@/logic/app/HabitsHandler'
import NoteEditor, { NoteDocumentData } from '@/logic/app/NoteEditor'
import WeekHandler from '@/logic/app/WeekHandler'
import DbHandler from '@/logic/app/DbHandler'
import MockRouter from '@/test-setup/mock/MockRouter'
import signInDummyUser from '@/test-setup/signInDummyUser'
import deleteHabitsDoc from '@/test-setup/deleteHabitsDoc'
import simulateInitialFetches from '@/test-setup/simulateInitialFetches'
import deleteNotes from '@/test-setup/deleteNotes'
import deleteWeeks from '@/test-setup/deleteWeeks'
import getFirebaseAdmin from '@/test-setup/getFirebaseAdmin'
import teardownFirebase from '@/test-setup/teardownFirebase'

// 🔨

const projectId = 'test-noteeditor'
const firebase = initializeFirebase(projectId)
const { db: adminDb } = getFirebaseAdmin(projectId)

let noteEditor: NoteEditor, weekHandler: WeekHandler, dbHandler: DbHandler
let router: MockRouter

const dummyHabit: Habit = { id: generateHabitId(), name: 'Note editor test habit A', icon: '✏️', status: 'active' }
const dummyWeekStartDate = '2021-09-27'
const dummyNoteA: NoteDocumentData = {
  id: generateNoteId(),
  title: 'Dummy note',
  icon: '🧪',
  content: 'Some cool content',
  habitId: dummyHabit.id,
  date: '2021-09-30',
  weekStartDate: dummyWeekStartDate
}
const dummyNoteB: NoteDocumentData = {
  id: generateNoteId(),
  title: 'Another dummy note',
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
  registerFirebaseInjectionTokens(firebase)
  await simulateInitialFetches()
  const habitsHandler = container.resolve(HabitsHandler)
  habitsHandler.setHabit(dummyHabit)
  dbHandler = container.resolve(DbHandler)
  weekHandler = container.resolve(WeekHandler)
  router = container.resolve(MockRouter)
  container.register('Router', { useValue: router })
})

afterEach(async () => {
  await deleteHabitsDoc(adminDb)
  await deleteNotes()
  await deleteWeeks(adminDb)
  container.clearInstances()
})

afterAll(async () => {
  await teardownFirebase(firebase)
})

function startNoteEditor() {
  noteEditor = container.resolve(NoteEditor)
}

// 🧪

describe('initialization', () => {
  test(`if router query param habitId is supplied, instantly generates empty note using the week in view's start date, with isNewNote set to true`, () => {
    router.setQuery({ habitId: dummyHabit.id })
    startNoteEditor()
    expect(noteEditor.isNewNote).toEqual(true)
    expect(noteEditor.note).toEqual({
      title: '',
      icon: '📝',
      content: '',
      habitId: dummyHabit.id,
      date: formatYYYYMMDD(new Date()),
      weekStartDate: weekHandler.weekInView.startDate,
      id: noteEditor.note?.id
    })
  })

  test('if query param id is an existing note id, loads the correct note data from the database, with isNewNote set to false', async () => {
    await dbHandler.updateNote(dummyNoteA)
    router.setQuery({ id: dummyNoteA.id })
    startNoteEditor()
    await when(() => !!noteEditor.note)
    expect(noteEditor.isNewNote).toEqual(false)
    expect(noteEditor.note).toEqual(dummyNoteA)
  })

  test(`if trying to generate an empty note but habitId does not correspond to any of the user's habits, routes back home`, () => {
    router.setQuery({ habitId: 'abc' })
    startNoteEditor()
    expect(router.push).toHaveBeenCalledWith('/home')
  })

  test('if trying to generate a new note but no habitId is supplied, routes back home', () => {
    router.setQuery({})
    startNoteEditor()
    expect(router.push).toHaveBeenCalledWith('/home')
  })
})

describe('behavior', () => {
  test('calling startEditing() sets isEditing to true', () => {
    router.setQuery({ habitId: dummyHabit.id })
    startNoteEditor()
    noteEditor.startEditing()
    expect(noteEditor.isEditing).toEqual(true)
  })

  test('calling finishEditing() sets isEditing to false', () => {
    router.setQuery({ habitId: dummyHabit.id })
    startNoteEditor()
    noteEditor.startEditing()
    noteEditor.finishEditing()
    expect(noteEditor.isEditing).toEqual(false)
  })

  test('the note title, icon and content can be updated', () => {
    router.setQuery({ habitId: dummyHabit.id })
    startNoteEditor()
    noteEditor.updateNote('icon', '😎')
    noteEditor.updateNote('title', 'Updated title')
    noteEditor.updateNote('content', 'Some content')
    expect(noteEditor.note).toHaveProperty('icon', '😎')
    expect(noteEditor.note).toHaveProperty('title', 'Updated title')
    expect(noteEditor.note).toHaveProperty('content', 'Some content')
  })

  test('finishing editing updates local note metadata if the note is in the week in view', () => {
    // The above condition is true for new notes. See first test.
    router.setQuery({ habitId: dummyHabit.id })
    startNoteEditor()
    noteEditor.updateNote('title', 'Hello!')
    noteEditor.updateNote('icon', '🌟')
    noteEditor.finishEditing()
    const note = noteEditor.note!
    expect(weekHandler.weekInView.notes).toEqual({ [dummyHabit.id]: [note.id] })
    expect(weekHandler.weekInView.notesMetadata?.[note.id]).toEqual({
      title: 'Hello!',
      icon: '🌟'
    })
  })

  test('saving first changes on a new note sets isNewNote to false', () => {
    router.setQuery({ habitId: dummyHabit.id })
    startNoteEditor()
    noteEditor.finishEditing()
    expect(noteEditor.isNewNote).toEqual(false)
  })

  test('finishing editing does not update local note metadata if the note is not in the week in view', async () => {
    await dbHandler.updateNote(dummyNoteA)
    router.setQuery({ id: dummyNoteA.id })
    startNoteEditor()
    noteEditor.updateNote('title', 'A fresh new title')
    noteEditor.finishEditing()
    expect(weekHandler.weekInView.notes).toBeUndefined()
    expect(weekHandler.weekInView.notesMetadata).toBeUndefined()
  })

  test('if editing completes but the note title is empty, it is automatically set to "Untitled note"', () => {
    router.setQuery({ habitId: dummyHabit.id })
    startNoteEditor()
    noteEditor.startEditing()
    noteEditor.finishEditing()
    expect(noteEditor.note?.title).toEqual('Untitled note')
  })

  test('finishing editing updates the corresponding note document in the database', async () => {
    router.setQuery({ habitId: dummyHabit.id })
    startNoteEditor()
    noteEditor.updateNote('title', 'Hello world!')
    noteEditor.updateNote('icon', '🌟')
    noteEditor.updateNote('content', 'Some content')
    await noteEditor.finishEditing()
    const noteDoc = await dbHandler.getNoteDoc(noteEditor.note!.id)
    expect(noteDoc).toEqual(noteEditor.note)
  })

  test('finishing editing updates the metadata in the corresponding week document', async () => {
    await dbHandler.updateNote(dummyNoteA)
    await dbHandler.updateNote(dummyNoteB)

    router.setQuery({ id: dummyNoteA.id })
    startNoteEditor()
    await when(() => !!noteEditor.note)
    noteEditor.updateNote('title', 'A cool new title')
    noteEditor.updateNote('icon', '😎')
    await noteEditor.finishEditing()

    router.setQuery({ id: dummyNoteB.id })
    startNoteEditor()
    await when(() => !!noteEditor.note)
    noteEditor.updateNote('title', 'Another awesome title')
    noteEditor.updateNote('icon', '⭐')
    await noteEditor.finishEditing()

    const weekDoc = await dbHandler.getWeekDoc(dummyWeekStartDate)
    expect(weekDoc?.notes).toEqual({
      [dummyHabit.id]: [dummyNoteA.id, dummyNoteB.id]
    })
    expect(weekDoc?.notesMetadata).toEqual({
      [dummyNoteA.id]: {
        title: 'A cool new title',
        icon: '😎'
      },
      [dummyNoteB.id]: {
        title: 'Another awesome title',
        icon: '⭐'
      }
    })
  })

  test('creating a note sets the startDate field in the corresponding week document', async () => {
    router.setQuery({ habitId: dummyHabit.id })
    startNoteEditor()
    await noteEditor.finishEditing()
    const weekDoc = await dbHandler.getWeekDoc(noteEditor.note!.weekStartDate)
    expect(weekDoc?.startDate).toEqual(noteEditor.note!.weekStartDate)
  })

  test('deleting a note removes the corresponding note document from the database', async () => {
    await dbHandler.updateNote(dummyNoteA)
    router.setQuery({ id: dummyNoteA.id })
    startNoteEditor()
    await when(() => !!noteEditor.note)
    await noteEditor.deleteNote()
    const noteDoc = await dbHandler.getNoteDoc(dummyNoteA.id)
    expect(noteDoc).toBeNull()
  })

  test('deleting a note removes the metadata from the corresponding week document', async () => {
    await dbHandler.updateNote(dummyNoteA)

    router.setQuery({ id: dummyNoteA.id })
    startNoteEditor()
    await when(() => !!noteEditor.note)
    await noteEditor.deleteNote()

    const weekDoc = await dbHandler.getWeekDoc(dummyNoteA.weekStartDate)
    expect(weekDoc?.notes?.[dummyNoteA.habitId]?.includes(dummyNoteA.id)).toEqual(false)
    expect(weekDoc?.notesMetadata?.[dummyNoteA.id]).toBeUndefined()
  })

  test('deleting a note of the week in view clears the metadata from the local cache', async () => {
    await dbHandler.updateNote(dummyNoteA)
    await dbHandler.updateNote(dummyNoteB)

    await weekHandler.viewWeek(dummyWeekStartDate)

    router.setQuery({ id: dummyNoteB.id })
    startNoteEditor()
    await when(() => !!noteEditor.note)
    await noteEditor.deleteNote()

    const weekInView = weekHandler.weekInView
    expect(weekInView.notes?.[dummyNoteB.habitId]?.includes(dummyNoteB.id)).toEqual(false)
    expect(weekInView.notesMetadata?.[dummyNoteB.id]).toBeUndefined()
  })
})