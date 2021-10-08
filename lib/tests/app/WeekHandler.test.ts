import '@abraham/reflection'
import { container as globalContainer, DependencyContainer } from 'tsyringe'
import { collection, deleteDoc, getDocs, query } from '@firebase/firestore'
import { when } from 'mobx'
import { db } from '@/lib/firebase'
import { formatFirstDayOfThisWeek } from '@/lib/logic/utils/dateUtilities'
import WeekHandler, { HabitTrackerStatuses } from '@/lib/logic/app/WeekHandler'
import AuthUser from '@/lib/logic/app/AuthUser'
import DbHandler from '@/lib/logic/app/DbHandler'
import generateHabitId from '@/lib/logic/utils/generateHabitId'
import signInDummyUser from '@/test-setup/signIn'
import initializeHabitsHandler from '@/test-setup/initializeHabitsHandler'

// 🔨

let testContainer: DependencyContainer
let weekHandler: WeekHandler, dbHandler: DbHandler, authUser: AuthUser

const dummyTrackerStatuses: HabitTrackerStatuses = {
  [generateHabitId()]: { 0: ['⭐'], 3: ['👍'] },
  [generateHabitId()]: { 2: ['✨'], 6: ['🤏'] },
  [generateHabitId()]: { 1: ['😄'], 4: ['👎'], 5: ['👌'] },
}

async function initializeWeeksHandler() {
  testContainer = globalContainer.createChildContainer()
  await initializeHabitsHandler(testContainer)
  weekHandler = testContainer.resolve(WeekHandler)
}

beforeAll(async () => {
  await signInDummyUser()
  authUser = globalContainer.resolve(AuthUser)
  dbHandler = globalContainer.resolve(DbHandler)
})

afterEach(async () => {
  const weekDocs = await getDocs(query(collection(db, 'users', authUser.uid, 'weeks')))
  weekDocs.forEach(async (doc) => await deleteDoc(doc.ref))
})

// 🧪

describe('initialization', () => {
  test('if no weeks exist in database, set week in view to an empty week starting on this Monday', async () => {
    await initializeWeeksHandler()
    expect(weekHandler.weekInView.startDate).toEqual(formatFirstDayOfThisWeek())
    expect(weekHandler.weekInView.statuses).toEqual({})
  })

  test('if some weeks already exist in the database, initialize with the most recent one', async () => {
    const olderWeek = '2021-09-27', newerWeek = '2021-10-04'
    await dbHandler.updateWeekDoc(olderWeek, {})
    await dbHandler.updateWeekDoc(newerWeek, {})
    await initializeWeeksHandler()
    expect(weekHandler.weekInView.startDate).toEqual(newerWeek)
  })

  test('tracker statuses are correctly placed into week in view\'s local cache', async () => {
    await dbHandler.updateWeekDoc('2021-09-20', { statuses: dummyTrackerStatuses })
    await initializeWeeksHandler()
    expect(weekHandler.weekInView.statuses).toEqual(dummyTrackerStatuses)
  })
})

describe('behavior', () => {
  beforeEach(async () => {
    await initializeWeeksHandler()
  })

  test('setting data on an empty week will automatically add the start date to the document', async () => {
    const weekStartDate = formatFirstDayOfThisWeek()
    await weekHandler.setTrackerStatus(generateHabitId(), 0, ['🌱'])
    const weekDoc = await dbHandler.getWeekDoc(weekStartDate)
    expect(weekDoc?.startDate).toEqual(weekStartDate)
  })

  test('setting tracker statuses updates local cache and database correctly', async () => {
    const habitIdA = generateHabitId(), habitIdB = generateHabitId()
    await weekHandler.setTrackerStatus(habitIdA, 1, ['😎'])
    await weekHandler.setTrackerStatus(habitIdB, 4, ['🤔'])
    const expectedStatuses = {
      [habitIdA]: { 1: ['😎'] },
      [habitIdB]: { 4: ['🤔'] }
    }
    const weekDoc = await dbHandler.getWeekDoc(formatFirstDayOfThisWeek())
    expect(weekHandler.weekInView.statuses).toEqual(expectedStatuses)
    expect(weekDoc?.statuses).toEqual(expectedStatuses)
  })

  test('updating a tracker status returns the new status', async () => {
    const habitId = generateHabitId()
    expect(await weekHandler.setTrackerStatus(habitId, 1, ['👋'])).toEqual(['👋'])
  })

  test('attempting to update a tracker status without changing anything just returns the existing status', async () => {
    const habitId = generateHabitId()
    const firstUpdate = await weekHandler.setTrackerStatus(habitId, 1, ['😎'])
    const secondUpdate = await weekHandler.setTrackerStatus(habitId, 1, ['😎'])
    expect(firstUpdate === secondUpdate).toEqual(true)
  })

  test('similarly, updating an non-existent tracker status with an empty status returns the existing (undefined) value', async () => {
    const update = await weekHandler.setTrackerStatus(generateHabitId(), 5, [])
    expect(update).toBeUndefined()
  })

  test('clearing all tracker statuses for a given habit removes the habit field entirely, locally and in database', async () => {
    const habitId = generateHabitId()
    await weekHandler.setTrackerStatus(habitId, 0, ['🗑️'])
    await weekHandler.setTrackerStatus(habitId, 1, ['🗑️'])

    await weekHandler.setTrackerStatus(habitId, 0, [])
    await weekHandler.setTrackerStatus(habitId, 1, [])
    
    const weekDoc = await dbHandler.getWeekDoc(formatFirstDayOfThisWeek())
    expect(weekHandler.weekInView.statuses[habitId]).toBeUndefined()
    expect(weekDoc?.statuses[habitId]).toBeUndefined()
  })

  test('clearing a tracker status removes the habit\'s corresponding weekday id field, locally and in database', async () => {
    const habitId = generateHabitId()
    await weekHandler.setTrackerStatus(habitId, 0, ['😃'])
    await weekHandler.setTrackerStatus(habitId, 1, ['🗑️'])

    await weekHandler.setTrackerStatus(habitId, 1, [])

    const weekDoc = await dbHandler.getWeekDoc(formatFirstDayOfThisWeek())
    expect(weekHandler.weekInView.statuses[habitId][1]).toBeUndefined()
    expect(weekDoc?.statuses[habitId][1]).toBeUndefined()
  })

  test('switching to a non-existent week will generate an empty week', async () => {
    await weekHandler.viewWeek('2021-09-27')
    const { startDate, statuses } = weekHandler.weekInView
    expect(startDate).toEqual('2021-09-27')
    expect(statuses).toEqual({})
  })

  test('switching to a week that exists in database will load that week data', async () => {
    await dbHandler.updateWeekDoc('2021-09-20', { statuses: dummyTrackerStatuses })
    await weekHandler.viewWeek('2021-09-20')
    const { startDate, statuses } = weekHandler.weekInView
    expect(startDate).toEqual('2021-09-20')
    expect(statuses).toEqual(dummyTrackerStatuses)
  })

  test('switching weeks will immediately change week in view\'s start date, but will only update local data after loading is complete', async () => {
    await dbHandler.updateWeekDoc('2021-09-20', { statuses: dummyTrackerStatuses })
    await weekHandler.viewWeek('2021-10-04')
    weekHandler.viewWeek('2021-09-20')
    expect(weekHandler.weekInView.startDate).toEqual('2021-09-20')
    expect(weekHandler.weekInView.statuses).toEqual({})
    await when(() => !weekHandler.isLoadingWeek)
    expect(weekHandler.weekInView.statuses).toEqual(dummyTrackerStatuses)
  })
})

test('teardown: weeks collection is emptied', async () => {
  const weekDocs = await getDocs(query(collection(db, 'users', authUser.uid, 'weeks')))
  expect(weekDocs.size).toEqual(0)
})