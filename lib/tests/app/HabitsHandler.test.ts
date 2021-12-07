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

const commonHabitData = { archived: false, creationTime: 123, timeable: true, palette: [] as string[], visibility: 'private' } as const
const dummyHabitA: Habit = { id: generateHabitId(), name: 'Run tests', icon: '🧪', ...commonHabitData }
const dummyHabitB: Habit = { id: generateHabitId(), name: 'Build app', icon: '👨‍💻', ...commonHabitData }
const dummyHabitC: Habit = { id: generateHabitId(), name: 'Fix bugs', icon: '🐛', ...commonHabitData }

const sortByHabitId = (habits: Habit[]) => habits.sort((a: Habit, b: Habit) => a.id < b.id ? 1 : -1)

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
  test('if no data exists in database, activeHabits will be set to empty object', async () => {
    await initialize()
    expect(habitsHandler.activeHabits).toEqual({})
  })

  test('when a habit is fetched, it is placed in the activeHabits object, with the habit id as the key', async () => {
    await dbHandler.addHabit(dummyHabitA)
    await initialize()
    expect(habitsHandler.activeHabits).toEqual({ [dummyHabitA.id]: dummyHabitA })
  })

  test('habit order is fetched correctly', async () => {
    await dbHandler.addHabit(dummyHabitA)
    await dbHandler.addHabit(dummyHabitB)

    await initialize()
    expect(habitsHandler.order).toEqual([dummyHabitA.id, dummyHabitB.id])
  })

  test('if habit ids are missing from the fetched habit order, the missing habit ids are placed at the end of the "order" array', async () => {
    await dbHandler.addHabit(dummyHabitA)
    await dbHandler.addHabit(dummyHabitB)
    await dbHandler.addHabit(dummyHabitC)
    await dbHandler.update(dbHandler.habitDetailsDocRef(), { order: [dummyHabitC.id, dummyHabitB.id] })
    await initialize()
    expect(habitsHandler.order).toEqual([dummyHabitC.id, dummyHabitB.id, dummyHabitA.id])
    expect(sortByHabitId(Object.values(habitsHandler.activeHabits))).toEqual(sortByHabitId([dummyHabitC, dummyHabitB, dummyHabitA]))
  })
})

describe('behavior', () => {
  beforeEach(async () => {
    await initialize()
  })

  test('adding habits updates local cache and database correctly', async () => {
    await habitsHandler.setHabit(dummyHabitA)
    await habitsHandler.setHabit(dummyHabitB)

    expect(habitsHandler.activeHabits).toEqual({
      [dummyHabitA.id]: dummyHabitA,
      [dummyHabitB.id]: dummyHabitB
    })

    const activeHabitsDocs = await dbHandler.getActiveHabitsDocs()
    expect(sortByHabitId(activeHabitsDocs)).toEqual(sortByHabitId(Object.values(habitsHandler.activeHabits)))

    expect(await dbHandler.getHabitDetailsDoc()).toEqual({
      activeIds: { private: { [dummyHabitA.id]: true, [dummyHabitB.id]: true } },
      order: [dummyHabitA.id, dummyHabitB.id]
    })
  })

  test('updating a habit updates local cache and database correctly', async () => {
    await habitsHandler.setHabit(dummyHabitA)
    await habitsHandler.setHabit(dummyHabitB)

    const updatedHabit = { ...dummyHabitA, icon: '🤓' }
    await habitsHandler.setHabit(updatedHabit)

    expect(habitsHandler.activeHabits).toEqual({
      [updatedHabit.id]: updatedHabit,
      [dummyHabitB.id]: dummyHabitB
    })

    expect(sortByHabitId(await dbHandler.getActiveHabitsDocs())).toEqual(sortByHabitId(Object.values(habitsHandler.activeHabits)))
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
    habitsHandler.reorderHabitsLocally(a.id, c.id)
    await habitsHandler.uploadHabitOrder()
    expect(habitsHandler.order).toEqual([b.id, c.id, a.id])
    expect((await dbHandler.getHabitDetailsDoc())?.order).toEqual([b.id, c.id, a.id])
  })

  test('changing habit visibility updates the local cache and database correctly', async () => {
    const habit = await habitsHandler.setHabit(dummyHabitA)

    await habitsHandler.changeHabitVisibility(habit, 'public')
    expect(habit.visibility).toEqual('public')
    expect(await dbHandler.getHabitDetailsDoc()).toEqual({
      activeIds: { public: { [habit.id]: true }, private: {} },
      order: [habit.id]
    })

    await habitsHandler.changeHabitVisibility(habit, 'private')
    expect(habit.visibility).toEqual('private')
    expect(await dbHandler.getHabitDetailsDoc()).toEqual({
      activeIds: { public: {}, private: { [habit.id]: true } },
      order: [habit.id]
    })
  })

  test('deleting a habit removes it from local cache and database', async () => {
    await habitsHandler.setHabit(dummyHabitA)
    await habitsHandler.setHabit(dummyHabitB)
    await habitsHandler.deleteActiveHabitById(dummyHabitA.id)

    expect(habitsHandler.activeHabits).toEqual({ [dummyHabitB.id]: dummyHabitB })

    expect(await dbHandler.getActiveHabitsDocs()).toEqual([dummyHabitB])
    expect(await dbHandler.getHabitDetailsDoc()).toEqual({
      activeIds: { private: { [dummyHabitB.id]: true } },
      order: [dummyHabitB.id],
      linked: {}
    })
  })

  test('archiving a habit updates the local cache and database correctly', async () => {
    await habitsHandler.setHabit(dummyHabitA)
    await habitsHandler.setHabit(dummyHabitB)
    await habitsHandler.archiveHabitById(dummyHabitA.id)

    expect(habitsHandler.activeHabits).toEqual({ [dummyHabitB.id]: dummyHabitB })

    const archivedHabit = await dbHandler.getDocData(dbHandler.habitDocRef(dummyHabitA.id))
    expect(archivedHabit?.archived).toEqual(true)
    expect(await dbHandler.getDocData(dbHandler.archivedHabitsDocRef)).toEqual({
      [dummyHabitA.id]: {
        name: dummyHabitA.name,
        icon: dummyHabitA.icon,
        archiveTime: expect.any(Number)
      }
    })
    expect(await dbHandler.getActiveHabitsDocs()).toEqual([dummyHabitB])
    expect(await dbHandler.getHabitDetailsDoc()).toEqual({
      activeIds: { private: { [dummyHabitB.id]: true } },
      order: [dummyHabitB.id],
      linked: {}
    })
  })

  test('restoring an archived habit updates the local cache and database correctly', async () => {
    await habitsHandler.setHabit(dummyHabitA)
    await habitsHandler.setHabit(dummyHabitB)
    await habitsHandler.archiveHabitById(dummyHabitA.id)
    await habitsHandler.restoreArchivedHabitById(dummyHabitA.id)

    expect(habitsHandler.activeHabits).toEqual({ [dummyHabitA.id]: dummyHabitA, [dummyHabitB.id]: dummyHabitB })
    const restoredHabit = await dbHandler.getDocData(dbHandler.habitDocRef(dummyHabitA.id))
    expect(restoredHabit?.archived).toEqual(false)
    expect(await dbHandler.getDocData(dbHandler.archivedHabitsDocRef)).toEqual({})
    expect(sortByHabitId(await dbHandler.getActiveHabitsDocs())).toEqual(sortByHabitId([dummyHabitA, dummyHabitB]))
    expect(await dbHandler.getHabitDetailsDoc()).toEqual({
      activeIds: { private: { [dummyHabitA.id]: true, [dummyHabitB.id]: true } },
      order: [dummyHabitB.id, dummyHabitA.id],
      linked: {}
    })
  })
})

test('habits docs are removed after tests', async () => {
  expect(await dbHandler.getActiveHabitsDocs()).toEqual([])
  expect(await dbHandler.getHabitDetailsDoc()).toBeUndefined()
})