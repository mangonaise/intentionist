import '@abraham/reflection'
import { container as globalContainer, DependencyContainer } from 'tsyringe'
import WeekIconsHandler from '@/lib/logic/app/WeekIconsHandler'
import WeekHandler from '@/lib/logic/app/WeekHandler'
import DbHandler from '@/lib/logic/app/DbHandler'
import signInDummyUser from '@/test-setup/signIn'
import AuthUser from '@/lib/logic/app/AuthUser'
import initializeTestApp from '@/test-setup/initializeTestApp'
import deleteWeeks from '@/test-setup/deleteWeeks'

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
  // ! Delete week icons collection
})

test('the week icon is initially undefined', () => {
  expect(weekHandler.weekInView.icon).toBeUndefined()
})

test('setting the week icon correctly updates the local cache for the week in view', () => {
  weekIconsHandler.setIcon('🌱')
  expect(weekHandler.weekInView.icon).toEqual('🌱')
})

test('setting the week icon correctly updates the corresponding week document in the database', async () => {
  await weekHandler.viewWeek('2021-10-11')
  await weekIconsHandler.setIcon('⭐')
  const weekDoc = await dbHandler.getWeekDoc('2021-10-11')
  expect(weekDoc?.icon).toEqual('⭐')
})

test('removing the week icon sets the value to null in the local cache for the week in view', () => {
  weekIconsHandler.setIcon('🗑️')
  weekIconsHandler.removeIcon()
  expect(weekHandler.weekInView.icon).toEqual(null)
})

test('removing the week icon deletes the icon field from the week document in the database', async () => {
  await weekHandler.viewWeek('2021-10-18')
  await weekIconsHandler.setIcon('😢')
  await weekIconsHandler.removeIcon()
  const weekDoc = await dbHandler.getWeekDoc('2021-10-18')
  expect(weekDoc?.icon).toBeUndefined
})