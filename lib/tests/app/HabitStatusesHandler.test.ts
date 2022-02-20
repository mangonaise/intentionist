import '@abraham/reflection'
import { container } from 'tsyringe'
import initializeFirebase, { registerFirebaseInjectionTokens } from '@/firebase-setup/initializeFirebase'
import HabitStatusesHandler from '@/logic/app/HabitStatusesHandler'
import HabitsHandler, { Habit } from '@/logic/app/HabitsHandler'
import signInDummyUser from '@/test-setup/signInDummyUser'
import simulateInitialFetches from '@/test-setup/simulateInitialFetches'
import teardownFirebase from '@/test-setup/teardownFirebase'
import getFirebaseAdmin from '@/test-setup/getFirebaseAdmin'
import deleteHabits from '@/test-setup/deleteHabits'
import getDbShortcuts from '@/test-setup/getDbShortcuts'
import generateHabitId from '@/logic/utils/generateHabitId'

//? "Habit status" = an emoji used to represent the daily status of a habit.
//? For example, a habit called "Exercise" could have a status of "👍" to represent good progress made on that day.

//#region test setup

const projectId = 'test-habitshandler'
const firebase = initializeFirebase(projectId)
const { db: adminDb } = getFirebaseAdmin(projectId)
const { habitDoc } = getDbShortcuts(adminDb)

let authUid: string
let statusesHandler: HabitStatusesHandler, habitsHandler: HabitsHandler
let testHabit: Habit
const testHabitProperties: Habit = { id: generateHabitId(), name: 'Test', icon: '🧪', archived: false, creationTime: 123, timeable: true, palette: [] as string[], visibility: 'public' }

beforeAll(async () => {
  authUid = (await signInDummyUser()).uid
})

beforeEach(async () => {
  registerFirebaseInjectionTokens(firebase)
  await simulateInitialFetches()
  habitsHandler = container.resolve(HabitsHandler)
  statusesHandler = container.resolve(HabitStatusesHandler)
  testHabit = await habitsHandler.setHabit(testHabitProperties)
})

afterEach(async () => {
  await deleteHabits(adminDb)
  container.clearInstances()
})

afterAll(async () => {
  await teardownFirebase(firebase)
})

//#endregion

describe('setting habit statuses', () => {
  test('setting habit statuses correctly updates local cache and database', async () => {
    await statusesHandler.setHabitStatus(testHabit, { year: 2021, dayOfYear: 325 }, '🌟')

    // local
    const habitStatuses = habitsHandler.activeHabits[testHabit.id].statuses
    expect(habitStatuses).toEqual({
      2021: {
        325: '🌟'
      }
    })

    // db
    const habitDocData = (await habitDoc(authUid, testHabit.id).get()).data()
    expect(habitDocData?.statuses).toEqual(habitStatuses)
  })

  test('removing a habit status correctly updates local cache and database', async () => {
    await statusesHandler.setHabitStatus(testHabit, { year: 2021, dayOfYear: 100 }, '🌟')
    await statusesHandler.setHabitStatus(testHabit, { year: 2021, dayOfYear: 200 }, '👍')

    // remove "🌟"
    await statusesHandler.setHabitStatus(testHabit, { year: 2021, dayOfYear: 100 }, null)

    // local
    let statuses = habitsHandler.activeHabits[testHabit.id].statuses
    expect(statuses).toEqual({ 2021: { 200: '👍' } })

    // db
    let habitDocData = (await habitDoc(authUid, testHabit.id).get()).data()
    expect(habitDocData?.statuses).toEqual(statuses)

    // remove "👍"
    await statusesHandler.setHabitStatus(testHabit, { year: 2021, dayOfYear: 200 }, null)

    // local
    statuses = habitsHandler.activeHabits[testHabit.id].statuses
    expect(statuses).toEqual({})

    // db
    habitDocData = (await habitDoc(authUid, testHabit.id).get()).data()
    expect(habitDocData?.statuses).toEqual(statuses)
  })
})

describe('getting weekly status data', () => {
  it('works for a week that takes place within one year', async () => {
    await statusesHandler.setHabitStatus(testHabit, { year: 2021, dayOfYear: 318 }, '🌟')
    await statusesHandler.setHabitStatus(testHabit, { year: 2021, dayOfYear: 319 }, '👍') // first day of week
    await statusesHandler.setHabitStatus(testHabit, { year: 2021, dayOfYear: 323 }, '🌟')
    await statusesHandler.setHabitStatus(testHabit, { year: 2021, dayOfYear: 324 }, '🤏')
    await statusesHandler.setHabitStatus(testHabit, { year: 2021, dayOfYear: 325 }, '👍') // last day of week 
    await statusesHandler.setHabitStatus(testHabit, { year: 2021, dayOfYear: 326 }, '🌟')

    expect(statusesHandler.getWeeklyHabitStatusData(testHabit, { year: 2021, dayOfYear: 319 })).toEqual([
      { date: { year: 2021, dayOfYear: 319 }, value: '👍', hasPreviousValue: true, hasNextValue: false },
      { date: { year: 2021, dayOfYear: 320 }, value: null, hasPreviousValue: true, hasNextValue: false },
      { date: { year: 2021, dayOfYear: 321 }, value: null, hasPreviousValue: false, hasNextValue: false },
      { date: { year: 2021, dayOfYear: 322 }, value: null, hasPreviousValue: false, hasNextValue: true },
      { date: { year: 2021, dayOfYear: 323 }, value: '🌟', hasPreviousValue: false, hasNextValue: true },
      { date: { year: 2021, dayOfYear: 324 }, value: '🤏', hasPreviousValue: true, hasNextValue: true },
      { date: { year: 2021, dayOfYear: 325 }, value: '👍', hasPreviousValue: true, hasNextValue: true }
    ])
  })

  it('works for a week that spans across two years', async () => {
    await statusesHandler.setHabitStatus(testHabit, { year: 2020, dayOfYear: 363 }, '🌟') // first day of week
    await statusesHandler.setHabitStatus(testHabit, { year: 2020, dayOfYear: 366 }, '🌟') // last day of year - 2020 is leap year
    await statusesHandler.setHabitStatus(testHabit, { year: 2021, dayOfYear: 1 }, '🌟')
    await statusesHandler.setHabitStatus(testHabit, { year: 2021, dayOfYear: 2 }, '🌟')

    expect(statusesHandler.getWeeklyHabitStatusData(testHabit, { year: 2020, dayOfYear: 363 })).toEqual([
      { date: { year: 2020, dayOfYear: 363 }, value: '🌟', hasPreviousValue: false, hasNextValue: false },
      { date: { year: 2020, dayOfYear: 364 }, value: null, hasPreviousValue: true, hasNextValue: false },
      { date: { year: 2020, dayOfYear: 365 }, value: null, hasPreviousValue: false, hasNextValue: true },
      { date: { year: 2020, dayOfYear: 366 }, value: '🌟', hasPreviousValue: false, hasNextValue: true },
      { date: { year: 2021, dayOfYear: 1 }, value: '🌟', hasPreviousValue: true, hasNextValue: true },
      { date: { year: 2021, dayOfYear: 2 }, value: '🌟', hasPreviousValue: true, hasNextValue: false },
      { date: { year: 2021, dayOfYear: 3 }, value: null, hasPreviousValue: true, hasNextValue: false }
    ])
  })
})