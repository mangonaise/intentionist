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

//#region test setup

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

async function initializeHabitsHandler() {
  await simulateInitialFetches()
  habitsHandler = container.resolve(HabitsHandler)
}

//#endregion

describe('initialization', () => {
  test('if no habits data exists in database, activeHabits will be set to an empty object', async () => {
    await initializeHabitsHandler()
    expect(habitsHandler.activeHabits).toEqual({})
  })

  test('when a habit is fetched from the db, it is placed in the activeHabits object, with the habit id as the key', async () => {
    await dbHandler.addHabit(dummyHabitA)
    await initializeHabitsHandler()

    expect(habitsHandler.activeHabits).toEqual({ [dummyHabitA.id]: dummyHabitA })
  })

  test('habit order is correctly fetched from the db and placed into the "order" array', async () => {
    await dbHandler.addHabit(dummyHabitA)
    await dbHandler.addHabit(dummyHabitB)
    await initializeHabitsHandler()

    expect(habitsHandler.order).toEqual([dummyHabitA.id, dummyHabitB.id])
  })

  test('if habit ids are missing from the fetched habit order, the missing habit ids are placed at the end of the "order" array', async () => {
    await dbHandler.addHabit(dummyHabitA)
    await dbHandler.addHabit(dummyHabitB)
    await dbHandler.addHabit(dummyHabitC)

    // habit A is missing from the order
    await dbHandler.update(dbHandler.habitDetailsDocRef(), { order: [dummyHabitC.id, dummyHabitB.id] })

    // it is restored on initialization
    await initializeHabitsHandler()
    expect(habitsHandler.order).toEqual([dummyHabitC.id, dummyHabitB.id, dummyHabitA.id])
    expect(sortByHabitId(Object.values(habitsHandler.activeHabits))).toEqual(sortByHabitId([dummyHabitC, dummyHabitB, dummyHabitA]))
  })
})

describe('behavior', () => {
  beforeEach(async () => {
    await initializeHabitsHandler()
  })

  test('adding habits updates local cache and database correctly', async () => {
    await habitsHandler.setHabit(dummyHabitA)
    await habitsHandler.setHabit(dummyHabitB)

    // local
    expect(habitsHandler.activeHabits).toEqual({
      [dummyHabitA.id]: dummyHabitA,
      [dummyHabitB.id]: dummyHabitB
    })

    // db
    const activeHabitsDocsData = await dbHandler.getActiveHabitsDocs()
    expect(sortByHabitId(activeHabitsDocsData)).toEqual(sortByHabitId(Object.values(habitsHandler.activeHabits)))
    expect(await dbHandler.getHabitDetailsDoc()).toEqual({
      activeIds: {
        private: {
          [dummyHabitA.id]: true,
          [dummyHabitB.id]: true
        }
      },
      order: [dummyHabitA.id, dummyHabitB.id]
    })
  })

  test('updating a habit updates local cache and database correctly', async () => {
    await habitsHandler.setHabit(dummyHabitA)
    await habitsHandler.setHabit(dummyHabitB)

    const updatedHabit = { ...dummyHabitA, icon: '🤓' }
    await habitsHandler.setHabit(updatedHabit)

    // local
    expect(habitsHandler.activeHabits).toEqual({
      [updatedHabit.id]: updatedHabit,
      [dummyHabitB.id]: dummyHabitB
    })

    // db
    const activeHabitsDocsData = await dbHandler.getActiveHabitsDocs()
    expect(sortByHabitId(activeHabitsDocsData)).toEqual(sortByHabitId(Object.values(habitsHandler.activeHabits)))
  })

  test('adding or updating a habit returns the updated habit when changes are made', async () => {
    const newHabitReturnValue = await habitsHandler.setHabit(dummyHabitA)
    expect(newHabitReturnValue).toEqual(dummyHabitA)

    const updatedHabit = { ...dummyHabitA, icon: '🤓' } as Habit
    const updatedHabitReturnValue = await habitsHandler.setHabit(updatedHabit)
    expect(updatedHabitReturnValue).toEqual(updatedHabit)
  })

  test('reordering habits updates the local cache and database correctly', async () => {
    const a = await habitsHandler.setHabit(dummyHabitA)
    const b = await habitsHandler.setHabit(dummyHabitB)
    const c = await habitsHandler.setHabit(dummyHabitC)

    habitsHandler.reorderHabitsLocally(a.id, c.id)
    await habitsHandler.uploadHabitOrder()

    // local
    expect(habitsHandler.order).toEqual([b.id, c.id, a.id])

    // db
    const habitDetailsDocData = await dbHandler.getHabitDetailsDoc()
    expect(habitDetailsDocData?.order).toEqual([b.id, c.id, a.id])
  })

  test('changing habit visibility updates the local cache and database correctly', async () => {
    const habit = await habitsHandler.setHabit(dummyHabitA)

    await habitsHandler.changeHabitVisibility(habit, 'public')

    // local
    expect(habit.visibility).toEqual('public')

    // db
    const habitDetailsDocData = await dbHandler.getHabitDetailsDoc()
    expect(habitDetailsDocData).toEqual({
      activeIds: {
        public: {
          [habit.id]: true
        },
        private: {}
      },
      order: [habit.id]
    })
  })

  test('deleting a habit removes it from local cache and database', async () => {
    await habitsHandler.setHabit(dummyHabitA)
    await habitsHandler.setHabit(dummyHabitB)
    await habitsHandler.deleteActiveHabitById(dummyHabitA.id)

    // local
    expect(habitsHandler.activeHabits).toEqual({ [dummyHabitB.id]: dummyHabitB })

    // db
    const activeHabitsDocsData = await dbHandler.getActiveHabitsDocs()
    const habitDetailsDocData = await dbHandler.getHabitDetailsDoc()
    expect(activeHabitsDocsData).toEqual([dummyHabitB])
    expect(habitDetailsDocData).toEqual({
      activeIds: {
        private: {
          [dummyHabitB.id]: true
        }
      },
      order: [dummyHabitB.id],
    })
  })

  test('archiving a habit updates the local cache and database correctly', async () => {
    await habitsHandler.setHabit(dummyHabitA)
    await habitsHandler.setHabit(dummyHabitB)
    await habitsHandler.archiveHabitById(dummyHabitA.id)

    // local
    expect(habitsHandler.activeHabits).toEqual({ [dummyHabitB.id]: dummyHabitB })

    // db
    const newlyArchivedHabitDocData = await dbHandler.getDocData(dbHandler.habitDocRef(dummyHabitA.id))
    const allArchivedHabitsDocData = await dbHandler.getDocData(dbHandler.archivedHabitsDocRef)
    expect(newlyArchivedHabitDocData?.archived).toEqual(true)
    expect(allArchivedHabitsDocData).toEqual({
      [dummyHabitA.id]: {
        name: dummyHabitA.name,
        icon: dummyHabitA.icon,
        archiveTime: expect.any(Number)
      }
    })
    expect(await dbHandler.getActiveHabitsDocs()).toEqual([dummyHabitB])
    expect(await dbHandler.getHabitDetailsDoc()).toEqual({
      activeIds: {
        private: {
          [dummyHabitB.id]: true
        }
      },
      order: [dummyHabitB.id],
    })
  })

  test('restoring an archived habit updates the local cache and database correctly', async () => {
    await habitsHandler.setHabit(dummyHabitA)
    await habitsHandler.setHabit(dummyHabitB)
    await habitsHandler.archiveHabitById(dummyHabitA.id)
    await habitsHandler.restoreArchivedHabitById(dummyHabitA.id)

    // local
    expect(habitsHandler.activeHabits).toEqual({ [dummyHabitA.id]: dummyHabitA, [dummyHabitB.id]: dummyHabitB })
    expect(habitsHandler.order).toEqual([dummyHabitB.id, dummyHabitA.id])

    // db
    const restoredHabitDocData = await dbHandler.getDocData(dbHandler.habitDocRef(dummyHabitA.id))
    const archivedHabitsDocData = await dbHandler.getDocData(dbHandler.archivedHabitsDocRef)
    const activeHabitsDocsData = await dbHandler.getActiveHabitsDocs()
    const habitDetailsDoc = await dbHandler.getHabitDetailsDoc()
    expect(restoredHabitDocData?.archived).toEqual(false)
    expect(archivedHabitsDocData).toEqual({})
    expect(sortByHabitId(activeHabitsDocsData)).toEqual(sortByHabitId([dummyHabitA, dummyHabitB]))
    expect(habitDetailsDoc).toEqual({
      activeIds: {
        private: {
          [dummyHabitA.id]: true,
          [dummyHabitB.id]: true
        }
      },
      order: [dummyHabitB.id, dummyHabitA.id],
    })
  })
})