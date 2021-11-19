import '@abraham/reflection'
import { container } from 'tsyringe'
import initializeFirebase, { registerFirebaseInjectionTokens } from '@/firebase-setup/initializeFirebase'
import signInDummyUser from '@/test-setup/signInDummyUser'
import simulateInitialFetches from '@/test-setup/simulateInitialFetches'
import teardownFirebase from '@/test-setup/teardownFirebase'
import getFirebaseAdmin from '@/test-setup/getFirebaseAdmin'
import deleteHabits from '@/test-setup/deleteHabits'
import HabitsHandler, { Habit } from '@/logic/app/HabitsHandler'
import DbHandler from '@/logic/app/DbHandler'
import generateHabitId from '@/logic/utils/generateHabitId'

// 🔨

const projectId = 'test-habitshandler'
const firebase = initializeFirebase(projectId)
const { db: adminDb } = getFirebaseAdmin(projectId)

let dbHandler: DbHandler, habitsHandler: HabitsHandler
const dummyHabitA: Habit = { id: generateHabitId(), name: 'Run tests', icon: '🧪', archived: false, creationTime: 123, timeable: true, palette: [] }
const dummyHabitB: Habit = { id: generateHabitId(), name: 'Build app', icon: '👨‍💻', archived: false, creationTime: 123, timeable: true, palette: [] }
const dummyHabitC: Habit = { id: generateHabitId(), name: 'Fix bugs', icon: '🐛', archived: false, creationTime: 123, timeable: true, palette: [] }

beforeAll(async () => {
  await signInDummyUser()
})

beforeEach(async () => {
  registerFirebaseInjectionTokens(firebase)
  dbHandler = container.resolve(DbHandler)
})

afterEach(async () => {
  await deleteHabits(adminDb)
  container.clearInstances()
})

afterAll(async () => {
  await teardownFirebase(firebase)
})

async function initialize() {
  await simulateInitialFetches()
  habitsHandler = container.resolve(HabitsHandler)
}

// 🧪

describe('initialization', () => {
  test('if no data exists in database, active habits will be set to empty array', async () => {
    await initialize()
    expect(habitsHandler.activeHabits).toEqual([])
  })

  test('when a habit is fetched, it is placed in an array in local cache', async () => {
    await dbHandler.updateHabit(dummyHabitA, [dummyHabitA.id])
    await initialize()
    expect(habitsHandler.activeHabits).toEqual([dummyHabitA])
  })

  test('fetched habits are ordered correctly', async () => {
    await dbHandler.updateHabit(dummyHabitA, [dummyHabitA.id])
    await dbHandler.updateHabit(dummyHabitB, [dummyHabitB.id, dummyHabitA.id])

    await initialize()
    expect(habitsHandler.activeHabits).toEqual([dummyHabitB, dummyHabitA])
  })

  test('if habit ids are missing from the fetched habit order, they are placed at the end of the local habits array', async () => {
    await dbHandler.updateHabit(dummyHabitA, [])
    await dbHandler.updateHabit(dummyHabitB, [])
    await dbHandler.updateHabit(dummyHabitC, [dummyHabitC.id, dummyHabitB.id])
    await initialize()
    expect(habitsHandler.activeHabits).toEqual([dummyHabitC, dummyHabitB, dummyHabitA])
  })
})

describe('behavior', () => {
  beforeEach(async () => {
    await initialize()
  })

  test('adding habits updates local cache and database correctly', async () => {
    await habitsHandler.setHabit(dummyHabitA)
    await habitsHandler.setHabit(dummyHabitB)

    expect(habitsHandler.activeHabits).toEqual([dummyHabitA, dummyHabitB])

    const activeHabitsDocs = await dbHandler.getActiveHabitsDocs()
    const byId = (a: Habit, b: Habit) => a.id < b.id ? 1 : -1
    expect(activeHabitsDocs.sort(byId)).toEqual(habitsHandler.activeHabits.sort(byId))

    expect(await dbHandler.getHabitDetailsDoc()).toEqual({
      activeIds: { [dummyHabitA.id]: true, [dummyHabitB.id]: true },
      order: [dummyHabitA.id, dummyHabitB.id]
    })
  })

  xtest('updating a habit updates local cache and database correctly', async () => {
    await habitsHandler.setHabit(dummyHabitA)
    await habitsHandler.setHabit(dummyHabitB)

    const updatedHabit = { ...dummyHabitA, icon: '🤓' } as Habit
    await habitsHandler.setHabit(updatedHabit)

    expect(habitsHandler.activeHabits).toEqual([updatedHabit, dummyHabitB])

    expect((await dbHandler.getActiveHabitsDocs())).toEqual([
      dummyHabitA,
      dummyHabitB
    ])
  })

  xtest('adding or updating a habit returns the updated habit when changes are made', async () => {
    expect(await habitsHandler.setHabit(dummyHabitA)).toEqual(dummyHabitA)
    const updatedHabit = { ...dummyHabitA, icon: '🤓' } as Habit
    expect(await habitsHandler.setHabit(updatedHabit)).toEqual(updatedHabit)
  })

  xtest('attempting to update a habit without changing anything just returns the existing habit', async () => {
    const firstUpdate = await habitsHandler.setHabit(dummyHabitA)
    const secondUpdate = await habitsHandler.setHabit(dummyHabitA)
    expect(secondUpdate === firstUpdate).toBe(true)
  })

  xtest('reordering habits updates the local cache and database correctly', async () => {
    // const a = await habitsHandler.setHabit(dummyHabitA)
    // const b = await habitsHandler.setHabit(dummyHabitB)
    // const c = await habitsHandler.setHabit(dummyHabitC)
    // await habitsHandler.reorderHabits(a, c)
    // expect(habitsHandler.activeHabits).toEqual([b, c, a])
    // expect((await getActiveHabitsDocs())?.order).toEqual([b.id, c.id, a.id])
  })

  xtest('deleting a habit removes it from local cache and database', async () => {
    await habitsHandler.setHabit(dummyHabitA)
    await habitsHandler.setHabit(dummyHabitB)
    await habitsHandler.deleteHabitById(dummyHabitA.id)

    expect(habitsHandler.activeHabits).toEqual([dummyHabitB])

    expect(await dbHandler.getActiveHabitsDocs()).toEqual([dummyHabitB])
    expect(await dbHandler.getHabitDetailsDoc()).toEqual({
      activeIds: { [dummyHabitB.id]: true },
      order: [dummyHabitB.id]
    })
  })

  xtest('deleting a habit removes associated notes from database', async () => {
    await habitsHandler.setHabit(dummyHabitA)
    await dbHandler.update(dbHandler.noteDocRef('a1'), { habitId: dummyHabitA.id })
    await dbHandler.update(dbHandler.noteDocRef('a2'), { habitId: dummyHabitA.id })
    await dbHandler.update(dbHandler.noteDocRef('b1'), { habitId: dummyHabitB.id })
    await habitsHandler.deleteHabitById(dummyHabitA.id)
    expect(await dbHandler.getNoteDoc('a1')).toBeNull()
    expect(await dbHandler.getNoteDoc('a2')).toBeNull()
    expect(await dbHandler.getNoteDoc('b1')).not.toBeNull()
  })
})

test('habits docs are removed after tests', async () => {
  expect(await dbHandler.getActiveHabitsDocs()).toEqual([])
  expect(await dbHandler.getHabitDetailsDoc()).toBeUndefined()
})