import '@abraham/reflection'
import { container } from 'tsyringe'
import { when } from 'mobx'
import { formatYYYYMMDD } from '@/logic/utils/dateUtilities'
import initializeFirebase, { registerFirebaseInjectionTokens } from '@/firebase-setup/initializeFirebase'
import generateNoteId from '@/logic/utils/generateNoteId'
import generateHabitId from '@/logic/utils/generateHabitId'
import exclude from '@/logic/utils/exclude'
import HabitsHandler, { Habit } from '@/logic/app/HabitsHandler'
import NoteEditor, { NoteDocumentData } from '@/logic/app/NoteEditor'
import DbHandler from '@/logic/app/DbHandler'
import FriendsHandler from '@/logic/app/FriendsHandler'
import MockRouter from '@/test-setup/mock/MockRouter'
import signInDummyUser from '@/test-setup/signInDummyUser'
import simulateInitialFetches from '@/test-setup/simulateInitialFetches'
import deleteNotes from '@/test-setup/deleteNotes'
import getFirebaseAdmin from '@/test-setup/getFirebaseAdmin'
import teardownFirebase from '@/test-setup/teardownFirebase'
import getDbShortcuts from '@/test-setup/getDbShortcuts'
import waitForRealtimeUpdates from '@/test-setup/waitForRealtimeUpdates'

// 🔨

const projectId = 'test-noteeditor'
const firebase = initializeFirebase(projectId)
const { db: adminDb } = getFirebaseAdmin(projectId)
const { friendsDoc, userDoc, userDataCollection } = getDbShortcuts(adminDb)

let noteEditor: NoteEditor, dbHandler: DbHandler
let authUserUid: string
let router: MockRouter

const dummyHabit: Habit = { id: generateHabitId(), name: 'Note editor test habit A', icon: '✏️', creationTime: 123, palette: [], timeable: true, archived: false }
const dummyNoteA: NoteDocumentData = {
  id: generateNoteId(),
  title: 'Dummy note',
  icon: '🧪',
  content: 'Some cool content',
  habitId: dummyHabit.id,
  date: '2021-09-30',
}
const dummyNoteB: NoteDocumentData = {
  id: generateNoteId(),
  title: 'Another dummy note',
  icon: '🔬',
  content: 'Some awesome content',
  habitId: dummyHabit.id,
  date: '2021-09-29',
}

beforeAll(async () => {
  authUserUid = (await signInDummyUser()).uid
})

beforeEach(async () => {
  registerFirebaseInjectionTokens(firebase)
  await simulateInitialFetches()
  const habitsHandler = container.resolve(HabitsHandler)
  habitsHandler.setHabit(dummyHabit)
  dbHandler = container.resolve(DbHandler)
  router = container.resolve(MockRouter)
  container.register('Router', { useValue: router })
})

afterEach(async () => {
  await deleteNotes()
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
    expect(noteEditor.habit).toEqual(dummyHabit)
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

  test(`if router query param "user" is supplied, correctly loads note belonging to the friend whose username is equal to "user"`, async () => {
    const friendUid = 'note-editor-test-friend-uid'
    const friendUsername = 'note_editor_test_friend_username'
    await friendsDoc(friendUid).set({ friends: { [authUserUid]: { time: 123 } } })
    await userDataCollection(friendUid).doc('habits').set({ habits: { [dummyHabit.id]: { ...exclude(dummyHabit, 'id') } }})
    await friendsDoc(authUserUid).set({ friends: { [friendUid]: { time: 123, username: friendUsername } } })

    const noteDocRef = userDoc(friendUid).collection('notes').doc(dummyNoteB.id)
    await noteDocRef.set(dummyNoteB)

    const friendsHandler = container.resolve(FriendsHandler)
    friendsHandler.listenToFriendsDoc()
    await waitForRealtimeUpdates()

    router.setQuery({ id: dummyNoteB.id, user: friendUsername })
    startNoteEditor()
    await when(() => !!noteEditor.note)

    expect(noteEditor.note).toEqual(dummyNoteB)
    expect(noteEditor.habit).toEqual(dummyHabit)

    friendsHandler.stopFriendsDocListener()
    await adminDb.recursiveDelete(userDoc(friendUid))
    await adminDb.recursiveDelete(userDoc(authUserUid))
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

  test('saving first changes on a new note sets isNewNote to false', () => {
    router.setQuery({ habitId: dummyHabit.id })
    startNoteEditor()
    noteEditor.finishEditing()
    expect(noteEditor.isNewNote).toEqual(false)
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

  test('deleting a note removes the corresponding note document from the database', async () => {
    await dbHandler.updateNote(dummyNoteA)
    router.setQuery({ id: dummyNoteA.id })
    startNoteEditor()
    await when(() => !!noteEditor.note)
    await noteEditor.deleteNote()
    const noteDoc = await dbHandler.getNoteDoc(dummyNoteA.id)
    expect(noteDoc).toBeNull()
  })
})