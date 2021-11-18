import '@abraham/reflection'
import { container } from 'tsyringe'
import initializeFirebase, { registerFirebaseInjectionTokens } from '@/firebase-setup/initializeFirebase'
import WeekIconsHandler from '@/logic/app/WeekIconsHandler'
import WeekHandler from '@/logic/app/WeekHandler'
import DbHandler from '@/logic/app/DbHandler'
import AuthUser from '@/logic/app/AuthUser'
import deleteWeeks from '@/test-setup/deleteWeeks'
import signInDummyUser from '@/test-setup/signInDummyUser'
import simulateInitialFetches from '@/test-setup/simulateInitialFetches'
import teardownFirebase from '@/test-setup/teardownFirebase'
import getFirebaseAdmin from '@/test-setup/getFirebaseAdmin'

// 🔨

const projectId = 'test-weekiconshandler'
const firebase = initializeFirebase(projectId)
const { db: adminDb } = getFirebaseAdmin(projectId)

let weekIconsHandler: WeekIconsHandler, weekHandler: WeekHandler, dbHandler: DbHandler
let uid: string

beforeAll(async () => {
  await signInDummyUser()
  uid = container.resolve(AuthUser).uid
  dbHandler = container.resolve(DbHandler)
})

beforeEach(async () => {
  registerFirebaseInjectionTokens(firebase)
  await simulateInitialFetches()
  weekHandler = container.resolve(WeekHandler)
  weekIconsHandler = container.resolve(WeekIconsHandler)
})

afterEach(async () => {
  await deleteWeeks(adminDb)
  await deleteWeekIcons()
  container.clearInstances()
})

afterAll(async () => {
  await teardownFirebase(firebase)
})

async function deleteWeekIcons() {
  await adminDb.recursiveDelete(adminDb.collection('users').doc(uid).collection('weekIcons'))
}

// 🧪

test('the week icon is initially undefined', () => {
  expect(weekHandler.weekInView.weekData.icon).toBeUndefined()
})

describe('updating week data', () => {
  test('setting week icon correctly updates the week in view locally', () => {
    weekIconsHandler.setIcon('🌱')
    expect(weekHandler.weekInView.weekData.icon).toEqual('🌱')
  })

  test('setting week icon correctly updates the corresponding week document in the database', async () => {
    await weekHandler.viewWeek({ startDate: '2021-10-11' })
    await weekIconsHandler.setIcon('⭐')
    const weekDoc = await dbHandler.getWeekDoc('2021-10-11')
    expect(weekDoc?.icon).toEqual('⭐')
    expect(weekDoc?.startDate).toEqual('2021-10-11')
  })

  test('removing week icon sets the value to null in the week in view locally', () => {
    weekIconsHandler.setIcon('🗑️')
    weekIconsHandler.removeIcon()
    expect(weekHandler.weekInView.weekData.icon).toEqual(null)
  })

  test('removing week icon deletes the icon field from the week document in the database', async () => {
    await weekHandler.viewWeek({ startDate: '2021-10-18' })
    await weekIconsHandler.setIcon('😢')
    await weekIconsHandler.removeIcon()
    const weekDoc = await dbHandler.getWeekDoc('2021-10-18')
    expect(weekDoc?.icon).toBeUndefined
  })
})

describe('updating weekIcons collection in database', () => {
  test(`setting a week icon updates the field corresponding to the week's start date in a document corresponding to the week's year`, async () => {
    await weekHandler.viewWeek({ startDate: '2021-10-04' })
    await weekIconsHandler.setIcon('👨‍💻')
    const iconsDoc = await dbHandler.getDocData(dbHandler.weekIconsDocRef('2021'))
    expect(iconsDoc?.['10-04']).toEqual('👨‍💻')
  })

  test('adding multiple week icons in the same year works', async () => {
    await weekHandler.viewWeek({ startDate: '2020-09-06' })
    await weekIconsHandler.setIcon('😎')
    await weekHandler.viewWeek({ startDate: '2020-09-13' })
    await weekIconsHandler.setIcon('⭐')
    await weekHandler.viewWeek({ startDate: '2020-09-20' })
    await weekIconsHandler.setIcon('😃')
    const iconsDoc = await dbHandler.getDocData(dbHandler.weekIconsDocRef('2020'))
    expect(iconsDoc).toEqual({
      '09-06': '😎',
      '09-13': '⭐',
      '09-20': '😃'
    })
  })

  test('removing a week icon deletes the field from the corresponding week icons document', async () => {
    await weekHandler.viewWeek({ startDate: '2021-10-25' })
    await weekIconsHandler.setIcon('😢')
    await weekIconsHandler.removeIcon()
    const iconsDoc = await dbHandler.getDocData(dbHandler.weekIconsDocRef('2021'))
    expect(iconsDoc?.['10-25']).toBeUndefined()
  })
})

describe('handling cached icons', () => {
  const dummyIconsData = {
    '01-04': '⭐',
    '06-14': '🙂',
    '12-27': '⛄'
  }

  test(`caching a year's week icons from the database works`, async () => {
    await dbHandler.update(dbHandler.weekIconsDocRef('2020'), dummyIconsData)
    await weekIconsHandler.cacheIconsInYear('2020')
    expect(weekIconsHandler.iconsCache['2020']).toEqual(dummyIconsData)
  })

  test('cacheIconsInYear has no return value on first fetch, but on subsequent attempts, returns the cached data instead of re-fetching', async () => {
    await dbHandler.update(dbHandler.weekIconsDocRef('2020'), dummyIconsData)
    expect(await weekIconsHandler.cacheIconsInYear('2020')).toBeUndefined()
    expect(await weekIconsHandler.cacheIconsInYear('2020')).toEqual(dummyIconsData)
  })

  test(`after requesting a fetch, the cache's year field is immediately set to an empty object until the fetch is complete`, () => {
    weekIconsHandler.cacheIconsInYear('2020')
    expect(weekIconsHandler.iconsCache['2020']).toEqual({})
  })

  test('setting week icon correctly updates the corresponding field in the cache', async () => {
    await weekHandler.viewWeek({ startDate: '2021-10-25' })
    weekIconsHandler.setIcon('⭐')
    expect(weekIconsHandler.iconsCache['2021']?.['10-25']).toEqual('⭐')
  })

  test('removing a week icon deletes the corresponding field from the cache', async () => {
    await weekHandler.viewWeek({ startDate: '2021-10-18' })
    weekIconsHandler.setIcon('😎')
    weekIconsHandler.removeIcon()
    expect(weekIconsHandler.iconsCache['2021']['10-18']).toBeUndefined()
  })
})