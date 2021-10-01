import '@abraham/reflection'
import { container } from 'tsyringe'
import { when } from 'mobx'
import signInDummyUser from '@/test-setup/signIn'
import MockRouter from '@/test-setup/mock/MockRouter'
import DbHandler from '@/logic/app/DbHandler'
import HabitsHandler, { Habit } from '@/logic/app/HabitsHandler'
import HabitEditor from '@/logic/app/HabitEditor'

// 🔨

let habitsHandler: HabitsHandler

const router = container.resolve(MockRouter)
container.register('Router', { useValue: router })

const dummyHabit: Habit = { id: 'abcdefgh', name: 'Test habit editor', icon: '📝', status: 'active' }

beforeAll(async () => {
  await signInDummyUser()
  habitsHandler = container.resolve(HabitsHandler)
})

afterEach(async () => {
  router.setQuery({})
  for (const habit of habitsHandler.habits) {
    await habitsHandler.deleteHabitById(habit.id)
  }
})

// 🧪

describe('before habits have been fetched', () => {
  test('throws error', () => {
    expect(() => container.resolve(HabitEditor)).toThrow()
  })
})

describe('when habits have already been fetched', () => {
  beforeAll(async () => {
    await habitsHandler.fetchHabits()
  })

  test('if router query.id is "new", editor will initialize with new habit', () => {
    router.setQuery({ id: 'new' })
    const habitEditor = container.resolve(HabitEditor)
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
    const habitEditor = container.resolve(HabitEditor)
    expect(habitEditor.habit).toEqual(dummyHabit)
  })

  test('newly created habits are reflected in HabitsHandler', async () => {
    router.setQuery({ id: 'new' })

    let habitEditor = container.resolve(HabitEditor)
    const createdHabitA = habitEditor.habit
    habitEditor.saveAndExit()
    await when(() => container.resolve(DbHandler).isWriteComplete)

    habitEditor = container.resolve(HabitEditor)
    const createdHabitB = habitEditor.habit
    habitEditor.saveAndExit()
    await when(() => container.resolve(DbHandler).isWriteComplete)

    expect(habitsHandler.habits).toEqual([createdHabitA, createdHabitB])
  })

  test('updated habit is reflected in HabitsHandler', async () => {
    await habitsHandler.setHabit(dummyHabit)
    router.setQuery({ id: dummyHabit.id })
    const habitEditor = container.resolve(HabitEditor)
    habitEditor.updateHabit({ name: 'Updated name' })
    habitEditor.saveAndExit()
    await when(() => container.resolve(DbHandler).isWriteComplete)
    expect(habitsHandler.habits).toEqual([{ ...dummyHabit, name: 'Updated name' }])
  })
})

test('teardown: router query and habits are reset', () => {
  expect(router.query).toEqual({})
  expect(habitsHandler.habits).toEqual([])
})