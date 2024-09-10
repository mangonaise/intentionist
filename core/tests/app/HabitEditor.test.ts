import '@abraham/reflection'
import { container } from 'tsyringe'
import { when } from 'mobx'
import signInDummyUser from '@/test-setup/signInDummyUser'
import MockRouter from '@/test-setup/mock/MockRouter'
import simulateInitialFetches from '@/test-setup/simulateInitialFetches'
import teardownFirebase from '@/test-setup/teardownFirebase'
import initializeFirebase, { registerFirebaseInjectionTokens } from '@/firebase-setup/initializeFirebase'
import DbHandler from '@/logic/app/DbHandler'
import HabitsHandler, { Habit } from '@/logic/app/HabitsHandler'
import HabitEditor from '@/logic/app/HabitEditor'

//#region test setup

let habitEditor: HabitEditor
const firebase = initializeFirebase('test-habiteditor')
const router = container.resolve(MockRouter)
const dummyHabit: Habit = { id: 'abcdefgh', name: 'Test habit editor', icon: '📝', timeable: true, palette: [], creationTime: 123, archived: false, visibility: 'public' }

container.register('Router', { useValue: router })

function startHabitEditor() {
  habitEditor = container.resolve(HabitEditor)
}

beforeAll(async () => {
  await signInDummyUser()
})

afterEach(async () => {
  router.setQuery({})
})

afterAll(async () => {
  await teardownFirebase(firebase)
})

//#endregion

describe('before habits have been fetched', () => {
  test('throws error', () => {
    expect(() => container.resolve(HabitEditor)).toThrow()
  })
})

describe('when habits have already been fetched', () => {
  let habitsHandler: HabitsHandler

  beforeAll(async () => {
    await simulateInitialFetches()
  })

  beforeEach(() => {
    registerFirebaseInjectionTokens(firebase)
    habitsHandler = container.resolve(HabitsHandler)
  })

  afterEach(async () => {
    router.setQuery({})
    for (const habitId of Object.keys(habitsHandler.activeHabits)) {
      await habitsHandler.deleteActiveHabitById(habitId)
    }
  })

  test('if router query contains param "new", the editor will initialize with new habit', () => {
    router.setQuery({ new: '' })
    startHabitEditor()
    expect(habitEditor.isNewHabit).toEqual(true)
  })

  test('if no habit id matches query param id, the editor will route to home page', () => {
    router.setQuery({ id: 'idontexist' })
    container.resolve(HabitEditor)
    expect(router.push).toHaveBeenCalledWith('/home')
  })

  test('if query param id matches an existing habit, the editor will initialize with that existing habit', async () => {
    await habitsHandler.setHabit(dummyHabit)
    router.setQuery({ id: dummyHabit.id })
    startHabitEditor()
    expect(habitEditor.habit).toEqual(dummyHabit)
  })

  test('after saving and exiting from the editor, newly created habits are reflected in HabitsHandler', async () => {
    router.setQuery({ new: '' })

    startHabitEditor()
    const createdHabitA = habitEditor.habit
    habitEditor.saveAndExit()
    await when(() => container.resolve(DbHandler).isWriteComplete)

    expect(habitsHandler.activeHabits).toEqual({
      [createdHabitA!.id]: createdHabitA
    })
  })

  test('when a habit is updated, the changes are reflected in HabitsHandler', async () => {
    await habitsHandler.setHabit(dummyHabit)
    router.setQuery({ id: dummyHabit.id })

    startHabitEditor()
    habitEditor.updateHabit({ name: 'Updated name' })
    habitEditor.saveAndExit()
    await when(() => container.resolve(DbHandler).isWriteComplete)

    expect(habitsHandler.activeHabits).toEqual({
      [dummyHabit.id]: { ...dummyHabit, name: 'Updated name' }
    })
  })

  test('when a habit is deleted, the change is reflected in HabitsHandler', async () => {
    await habitsHandler.setHabit(dummyHabit)
    router.setQuery({ id: dummyHabit.id })

    startHabitEditor()
    habitEditor.deleteHabit()
    await when(() => container.resolve(DbHandler).isWriteComplete)

    expect(habitsHandler.activeHabits).toEqual({})
  })
})