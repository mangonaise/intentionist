import '@abraham/reflection'
import { container } from 'tsyringe'
import { when } from 'mobx'
import signInDummyUser from '@/test-setup/signIn'
import initializeHabitsHandler from '@/test-setup/initializeHabitsHandler'
import MockRouter from '@/test-setup/mock/MockRouter'
import DbHandler from '@/logic/app/DbHandler'
import HabitsHandler, { Habit } from '@/logic/app/HabitsHandler'
import HabitEditor from '@/logic/app/HabitEditor'

// 🔨

let habitEditor: HabitEditor

const router = container.resolve(MockRouter)
container.register('Router', { useValue: router })

const dummyHabit: Habit = { id: 'abcdefgh', name: 'Test habit editor', icon: '📝', status: 'active' }

function startHabitEditor() {
  habitEditor = container.resolve(HabitEditor)
}

beforeAll(async () => {
  await signInDummyUser()
})

afterEach(async () => {
  router.setQuery({})
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
    habitsHandler = await initializeHabitsHandler(container)
  })

  afterEach(async () => {
    router.setQuery({})
    for (const habit of habitsHandler.habits) {
      await habitsHandler.deleteHabitById(habit.id)
    }
  })

  test('if router query.id is "new", editor will initialize with new habit', () => {
    router.setQuery({ id: 'new' })
    startHabitEditor()
    expect(habitEditor.isNewHabit).toBe(true)
  })

  test('if no habit id matches router query.id, will route to habits page', () => {
    router.setQuery({ id: 'idontexist' })
    container.resolve(HabitEditor)
    expect(router.push).toHaveBeenCalledWith('/habits')
  })

  test('if router query.id matches existing habit, editor will initialize with existing habit', async () => {
    await habitsHandler.setHabit(dummyHabit)
    router.setQuery({ id: dummyHabit.id })
    startHabitEditor()
    expect(habitEditor.habit).toEqual(dummyHabit)
  })

  test('newly created habits are reflected in HabitsHandler', async () => {
    router.setQuery({ id: 'new' })

    startHabitEditor()
    const createdHabitA = habitEditor.habit
    habitEditor.saveAndExit()
    await when(() => container.resolve(DbHandler).isWriteComplete)

    startHabitEditor()
    const createdHabitB = habitEditor.habit
    habitEditor.saveAndExit()
    await when(() => container.resolve(DbHandler).isWriteComplete)

    expect(habitsHandler.habits).toEqual([createdHabitA, createdHabitB])
  })

  test('updated habit is reflected in HabitsHandler', async () => {
    await habitsHandler.setHabit(dummyHabit)
    router.setQuery({ id: dummyHabit.id })
    startHabitEditor()
    habitEditor.updateHabit({ name: 'Updated name' })
    habitEditor.saveAndExit()
    await when(() => container.resolve(DbHandler).isWriteComplete)
    expect(habitsHandler.habits).toEqual([{ ...dummyHabit, name: 'Updated name' }])
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
    expect(habitsHandler.habits).toEqual([])
  })

  test('teardown: habits are reset', () => {
    expect(habitsHandler.habits).toEqual([])
  })
})

test('teardown: query is reset', () => {
  expect(router.query).toEqual({})
})