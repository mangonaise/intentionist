import '@abraham/reflection'
import { omit } from 'lodash'
import { container } from 'tsyringe'
import signInDummyUser from '@/test-setup/signIn'
import resetHabits from '@/test-setup/resetHabits'
import DbHandler from '@/logic/app/DbHandler'
import HabitsHandler, { Habit } from '@/logic/app/HabitsHandler'
import generateHabitId from '@/logic/utils/generateHabitId'

// 🔨

let dbHandler: DbHandler, habitsHandler: HabitsHandler
const dummyHabitA: Habit = { id: generateHabitId(), name: 'Run tests', icon: '🧪', status: 'active' }
const dummyHabitB: Habit = { id: generateHabitId(), name: 'Build app', icon: '👨‍💻', status: 'active' }
const getHabitsDoc = async () => await dbHandler.getUserDoc('data', 'habits')

beforeAll(async () => {
  await signInDummyUser()
  dbHandler = container.resolve(DbHandler)
  habitsHandler = container.resolve(HabitsHandler)
})

afterEach(async () => {
  await resetHabits()
})

// 🧪

test('fetched habit is placed in an array in local cache', async () => {
  await dbHandler.updateUserDoc('data/habits', {
    habits: { [dummyHabitA.id]: { ...omit(dummyHabitA, 'id') } },
    order: [dummyHabitA.id]
  })
  await habitsHandler.fetchHabits()
  expect(habitsHandler.habits).toEqual([dummyHabitA])
})

test('fetched habits are ordered correctly', async () => {
  await dbHandler.updateUserDoc('data/habits', {
    habits: { 
      [dummyHabitA.id]: { ...omit(dummyHabitA, 'id') },
      [dummyHabitB.id]: { ...omit(dummyHabitB, 'id') }
    },
    order: [dummyHabitB.id, dummyHabitA.id]
  })
  await habitsHandler.fetchHabits()
  expect(habitsHandler.habits).toEqual([dummyHabitB, dummyHabitA])
})

test('if fetching non-existent data, local cache will remain as empty array', async () => {
  await habitsHandler.fetchHabits()
  expect(habitsHandler.habits).toEqual([])
})

test('attempting to fetch habits twice will instead return existing data', async () => {
  expect(await habitsHandler.fetchHabits()).toBeUndefined()
  expect(await habitsHandler.fetchHabits()).not.toBeUndefined()
})

test('hasFetchedHabits is only true after fetching habits', async () => {
  expect(habitsHandler.hasFetchedHabits).toBe(false)
  await habitsHandler.fetchHabits()
  expect(habitsHandler.hasFetchedHabits).toBe(true)
})

test('adding habits updates local cache and database correctly', async () => {
  await habitsHandler.setHabit(dummyHabitA)
  await habitsHandler.setHabit(dummyHabitB)

  expect(habitsHandler.habits).toEqual([dummyHabitA, dummyHabitB])

  expect(await getHabitsDoc()).toEqual({
    habits: {
      [dummyHabitA.id]: { ...omit(dummyHabitA, 'id') },
      [dummyHabitB.id]: { ...omit(dummyHabitB, 'id') }
    },
    order: [dummyHabitA.id, dummyHabitB.id]
  })
})

test('updating a habit updates local cache and database correctly', async () => {
  await habitsHandler.setHabit(dummyHabitA)
  await habitsHandler.setHabit(dummyHabitB)

  const updatedHabit = { ...dummyHabitA, icon: '🤓' } as Habit
  await habitsHandler.setHabit(updatedHabit)

  expect(habitsHandler.habits).toEqual([updatedHabit, dummyHabitB])

  expect((await getHabitsDoc())!.habits).toEqual({
    [dummyHabitA.id]: { name: dummyHabitA.name, icon: '🤓', status: dummyHabitA.status },
    [dummyHabitB.id]: { name: dummyHabitB.name, icon: dummyHabitB.icon, status: dummyHabitB.status }
  })
})

test('adding a new habit returns the new habit', async () => {
  expect(await habitsHandler.setHabit(dummyHabitA)).toEqual(dummyHabitA)
})

test('updating a habit returns the updated habit when changes are made', async () => {
  await habitsHandler.setHabit(dummyHabitA)
  const updatedHabit = { ...dummyHabitA, icon: '🤓' } as Habit
  expect(await habitsHandler.setHabit(updatedHabit)).toEqual(updatedHabit)
})

test('attempting to update a habit without changing anything just returns undefined', async () => {
  await habitsHandler.setHabit(dummyHabitA)
  expect(await habitsHandler.setHabit(dummyHabitA)).toBeUndefined()
})

test('deleting a habit removes it from local cache and database', async () => {
  await habitsHandler.setHabit(dummyHabitA)
  await habitsHandler.setHabit(dummyHabitB)
  await habitsHandler.deleteHabitById(dummyHabitA.id)

  expect(habitsHandler.habits).toEqual([dummyHabitB])

  expect(await getHabitsDoc()).toEqual({
    habits: {
      [dummyHabitB.id]: { name: dummyHabitB.name, icon: dummyHabitB.icon, status: dummyHabitB.status }
    },
    order: [dummyHabitB.id]
  })
})

test('teardown: local cache and habits doc correctly reset after tests', async () => {
  expect(habitsHandler.habits).toEqual([])
  expect(habitsHandler.hasFetchedHabits).toEqual(false)
  expect(await getHabitsDoc()).toBeUndefined()
})