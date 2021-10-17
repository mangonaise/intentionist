import '@abraham/reflection'
import { container } from 'tsyringe'
import signInDummyUser from '@/test-setup/signIn'
import deleteHabitsDoc from '@/test-setup/deleteHabitsDoc'
import initializeHabitsHandler from '@/test-setup/initializeHabitsHandler'
import DbHandler from '@/logic/app/DbHandler'
import HabitsHandler, { Habit } from '@/logic/app/HabitsHandler'
import generateHabitId from '@/logic/utils/generateHabitId'
import exclude from '@/lib/logic/utils/exclude'

// 🔨

let dbHandler: DbHandler, habitsHandler: HabitsHandler
const dummyHabitA: Habit = { id: generateHabitId(), name: 'Run tests', icon: '🧪', status: 'active' }
const dummyHabitB: Habit = { id: generateHabitId(), name: 'Build app', icon: '👨‍💻', status: 'active' }
const dummyHabitC: Habit = { id: generateHabitId(), name: 'Fix bugs', icon: '🐛', status: 'active' }
const getHabitsDoc = async () => await dbHandler.getUserDoc('data', 'habits')

beforeAll(async () => {
  await signInDummyUser()
  dbHandler = container.resolve(DbHandler)
})

afterEach(async () => {
  await deleteHabitsDoc()
})

// 🧪

describe('initialization', () => {
  test('if no data exists in database, local cache will be set to empty array', async () => {
    habitsHandler = await initializeHabitsHandler()
    expect(habitsHandler.habits).toEqual([])
  })

  test('fetched habit is placed in an array in local cache', async () => {
    await dbHandler.updateUserDoc('data/habits', {
      habits: { [dummyHabitA.id]: { ...exclude(dummyHabitA, 'id') } },
      order: [dummyHabitA.id]
    })
    habitsHandler = await initializeHabitsHandler()
    expect(habitsHandler.habits).toEqual([dummyHabitA])
  })

  test('fetched habits are ordered correctly', async () => {
    await dbHandler.updateUserDoc('data/habits', {
      habits: {
        [dummyHabitA.id]: { ...exclude(dummyHabitA, 'id') },
        [dummyHabitB.id]: { ...exclude(dummyHabitB, 'id') }
      },
      order: [dummyHabitB.id, dummyHabitA.id]
    })
    habitsHandler = await initializeHabitsHandler()
    expect(habitsHandler.habits).toEqual([dummyHabitB, dummyHabitA])
  })

  test('if habit ids are missing from the fetched habit order, they are placed at the end of the local habits array', async () => {
    await dbHandler.updateUserDoc('data/habits', {
      habits: {
        [dummyHabitA.id]: { ...exclude(dummyHabitA, 'id') },
        [dummyHabitB.id]: { ...exclude(dummyHabitB, 'id') },
        [dummyHabitC.id]: { ...exclude(dummyHabitC, 'id') }
      },
      order: [dummyHabitC.id, dummyHabitB.id]
    })
    habitsHandler = await initializeHabitsHandler()
    expect(habitsHandler.habits).toEqual([dummyHabitC, dummyHabitB, dummyHabitA])
  })
})

describe('behavior', () => {
  beforeEach(async () => {
    habitsHandler = await initializeHabitsHandler()
  })

  test('adding habits updates local cache and database correctly', async () => {
    await habitsHandler.setHabit(dummyHabitA)
    await habitsHandler.setHabit(dummyHabitB)

    expect(habitsHandler.habits).toEqual([dummyHabitA, dummyHabitB])

    expect(await getHabitsDoc()).toEqual({
      habits: {
        [dummyHabitA.id]: { ...exclude(dummyHabitA, 'id') },
        [dummyHabitB.id]: { ...exclude(dummyHabitB, 'id') }
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

  test('adding or updating a habit returns the updated habit when changes are made', async () => {
    expect(await habitsHandler.setHabit(dummyHabitA)).toEqual(dummyHabitA)
    const updatedHabit = { ...dummyHabitA, icon: '🤓' } as Habit
    expect(await habitsHandler.setHabit(updatedHabit)).toEqual(updatedHabit)
  })

  test('attempting to update a habit without changing anything just returns the existing habit', async () => {
    const firstUpdate = await habitsHandler.setHabit(dummyHabitA)
    const secondUpdate = await habitsHandler.setHabit(dummyHabitA)
    expect(secondUpdate === firstUpdate).toBe(true)
  })

  test('reordering habits updates the local cache and database correctly', async () => {
    const a = await habitsHandler.setHabit(dummyHabitA)
    const b = await habitsHandler.setHabit(dummyHabitB)
    const c = await habitsHandler.setHabit(dummyHabitC)
    await habitsHandler.reorderHabits(a, c)
    expect(habitsHandler.habits).toEqual([b, c, a])
    expect((await getHabitsDoc())?.order).toEqual([b.id, c.id, a.id])
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

  test('deleting a habit removes associated journal entries from database', async () => {
    await habitsHandler.setHabit(dummyHabitA)
    await dbHandler.updateUserDoc('journal/a1', { habitId: dummyHabitA.id })
    await dbHandler.updateUserDoc('journal/a2', { habitId: dummyHabitA.id })
    await dbHandler.updateUserDoc('journal/b1', { habitId: dummyHabitB.id })
    await habitsHandler.deleteHabitById(dummyHabitA.id)
    expect(await dbHandler.getJournalEntryDoc('a1')).toBeNull()
    expect(await dbHandler.getJournalEntryDoc('a2')).toBeNull()
    expect(await dbHandler.getJournalEntryDoc('b1')).not.toBeNull()
  })
})

test('habits doc removed after tests', async () => {
  expect(await getHabitsDoc()).toBeUndefined()
})