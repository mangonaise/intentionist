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

// 🔨

const firebase = initializeFirebase('test-habiteditor')

let habitEditor: HabitEditor

const router = container.resolve(MockRouter)
container.register('Router', { useValue: router })

const dummyHabit: Habit = { id: 'abcdefgh', name: 'Test habit editor', icon: '📝', timeable: true, palette: [], creationTime: 123, archived: false, visibility: 'public' }

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

// 🧪

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
    for (const habit of habitsHandler.activeHabits) {
      await habitsHandler.deleteHabitById(habit.id)
    }
  })

  test('if router query contains param "new", editor will initialize with new habit', () => {
    router.setQuery({ new: '' })
    startHabitEditor()
    expect(habitEditor.isNewHabit).toBe(true)
  })

  test('if no habit id matches query param id, will route to habits page', () => {
    router.setQuery({ id: 'idontexist' })
    container.resolve(HabitEditor)
    expect(router.push).toHaveBeenCalledWith('/habits')
  })

  test('if query param id matches existing habit, editor will initialize with existing habit', async () => {
    await habitsHandler.setHabit(dummyHabit)
    router.setQuery({ id: dummyHabit.id })
    startHabitEditor()
    expect(habitEditor.habit).toEqual(dummyHabit)
  })

  test('newly created habits are reflected in HabitsHandler', async () => {
    router.setQuery({ new: '' })

    startHabitEditor()
    const createdHabitA = habitEditor.habit
    habitEditor.saveAndExit()
    await when(() => container.resolve(DbHandler).isWriteComplete)

    startHabitEditor()
    const createdHabitB = habitEditor.habit
    habitEditor.saveAndExit()
    await when(() => container.resolve(DbHandler).isWriteComplete)

    expect(habitsHandler.activeHabits).toEqual([createdHabitA, createdHabitB])
  })

  test('updated habit is reflected in HabitsHandler', async () => {
    await habitsHandler.setHabit(dummyHabit)
    router.setQuery({ id: dummyHabit.id })
    startHabitEditor()
    habitEditor.updateHabit({ name: 'Updated name' })
    habitEditor.saveAndExit()
    await when(() => container.resolve(DbHandler).isWriteComplete)
    expect(habitsHandler.activeHabits).toEqual([{ ...dummyHabit, name: 'Updated name' }])
  })

  test('on exit, return to app home page if query param returnHome is true', async () => {
    await habitsHandler.setHabit(dummyHabit)
    router.setQuery({ id: dummyHabit.id, returnHome: 'true' })
    startHabitEditor()
    habitEditor.exit()
    expect(router.push).toHaveBeenCalledWith('/home')
  })

  test('deleted habit is reflected in HabitsHandler', async () => {
    await habitsHandler.setHabit(dummyHabit)
    router.setQuery({ id: dummyHabit.id })
    startHabitEditor()
    habitEditor.deleteHabit()
    await when(() => container.resolve(DbHandler).isWriteComplete)
    expect(habitsHandler.activeHabits).toEqual([])
  })

  test('teardown: habits are reset', () => {
    expect(habitsHandler.activeHabits).toEqual([])
  })
})

test('teardown: query is reset', () => {
  expect(router.query).toEqual({})
})