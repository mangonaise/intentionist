import '@abraham/reflection'
import { container as globalContainer, DependencyContainer } from 'tsyringe'
import WeekIconsHandler from '@/lib/logic/app/WeekIconsHandler'
import WeekHandler from '@/lib/logic/app/WeekHandler'
import DbHandler from '@/lib/logic/app/DbHandler'
import signInDummyUser from '@/test-setup/signInDummyUser'
import AuthUser from '@/lib/logic/app/AuthUser'
import initializeTestApp from '@/test-setup/initializeTestApp'
import deleteWeeks from '@/test-setup/deleteWeeks'
import deleteWeekIcons from '@/test-setup/deleteWeekIcons'

let testContainer: DependencyContainer
let weekIconsHandler: WeekIconsHandler, weekHandler: WeekHandler, dbHandler: DbHandler

async function initialize() {
  testContainer = globalContainer.createChildContainer()
  await initializeTestApp(testContainer)
  weekHandler = testContainer.resolve(WeekHandler)
  weekIconsHandler = testContainer.resolve(WeekIconsHandler)
}

beforeAll(async () => {
  await signInDummyUser()
  globalContainer.resolve(AuthUser)
  dbHandler = globalContainer.resolve(DbHandler)
})

beforeEach(async () => {
  await initialize()
})

afterEach(async () => {
  await deleteWeeks()
  await deleteWeekIcons()
})

test('the week icon is initially undefined', () => {
  expect(weekHandler.weekInView.icon).toBeUndefined()
})

describe('updating week data', () => {
  test('setting week icon correctly updates the week in view locally', () => {
    weekIconsHandler.setIcon('🌱')
    expect(weekHandler.weekInView.icon).toEqual('🌱')
  })

  test('setting week icon correctly updates the corresponding week document in the database', async () => {
    await weekHandler.viewWeek('2021-10-11')
    await weekIconsHandler.setIcon('⭐')
    const weekDoc = await dbHandler.getWeekDoc('2021-10-11')
    expect(weekDoc?.icon).toEqual('⭐')
    expect(weekDoc?.startDate).toEqual('2021-10-11')
  })

  test('removing week icon sets the value to null in the week in view locally', () => {
    weekIconsHandler.setIcon('🗑️')
    weekIconsHandler.removeIcon()
    expect(weekHandler.weekInView.icon).toEqual(null)
  })

  test('removing week icon deletes the icon field from the week document in the database', async () => {
    await weekHandler.viewWeek('2021-10-18')
    await weekIconsHandler.setIcon('😢')
    await weekIconsHandler.removeIcon()
    const weekDoc = await dbHandler.getWeekDoc('2021-10-18')
    expect(weekDoc?.icon).toBeUndefined
  })
})

describe('updating weekIcons collection in database', () => {
  test(`setting a week icon updates the field corresponding to the week's start date in a document corresponding to the week's year`, async () => {
    await weekHandler.viewWeek('2021-10-04')
    await weekIconsHandler.setIcon('👨‍💻')
    const iconsDoc = await dbHandler.getOwnDoc('weekIcons', '2021')
    expect(iconsDoc?.['10-04']).toEqual('👨‍💻')
  })

  test('adding multiple week icons in the same year works', async () => {
    await weekHandler.viewWeek('2020-09-06')
    await weekIconsHandler.setIcon('😎')
    await weekHandler.viewWeek('2020-09-13')
    await weekIconsHandler.setIcon('⭐')
    await weekHandler.viewWeek('2020-09-20')
    await weekIconsHandler.setIcon('😃')
    const iconsDoc = await dbHandler.getOwnDoc('weekIcons', '2020')
    expect(iconsDoc).toEqual({
      '09-06': '😎',
      '09-13': '⭐',
      '09-20': '😃'
    })
  })

  test('removing a week icon deletes the field from the corresponding week icons document', async () => {
    await weekHandler.viewWeek('2021-10-25')
    await weekIconsHandler.setIcon('😢')
    await weekIconsHandler.removeIcon()
    const iconsDoc = await dbHandler.getOwnDoc('weekIcons', '2021')
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
    await dbHandler.updateOwnDoc('weekIcons/2020', dummyIconsData)
    await weekIconsHandler.cacheIconsInYear('2020')
    expect(weekIconsHandler.iconsCache['2020']).toEqual(dummyIconsData)
  })

  test('cacheIconsInYear has no return value on first fetch, but on subsequent attempts, returns the cached data instead of re-fetching', async () => {
    await dbHandler.updateOwnDoc('weekIcons/2020', dummyIconsData)
    expect(await weekIconsHandler.cacheIconsInYear('2020')).toBeUndefined()
    expect(await weekIconsHandler.cacheIconsInYear('2020')).toEqual(dummyIconsData)
  })

  test(`after requesting a fetch, the cache's year field is immediately set to an empty object until the fetch is complete`, () => {
    weekIconsHandler.cacheIconsInYear('2020')
    expect(weekIconsHandler.iconsCache['2020']).toEqual({})
  })

  test('setting week icon correctly updates the corresponding field in the cache', async () => {
    await weekHandler.viewWeek('2021-10-25')
    weekIconsHandler.setIcon('⭐')
    expect(weekIconsHandler.iconsCache['2021']?.['10-25']).toEqual('⭐')
  })

  test('removing a week icon deletes the corresponding field from the cache', async () => {
    await weekHandler.viewWeek('2021-10-18')
    weekIconsHandler.setIcon('😎')
    weekIconsHandler.removeIcon()
    expect(weekIconsHandler.iconsCache['2021']['10-18']).toBeUndefined()
  })
})