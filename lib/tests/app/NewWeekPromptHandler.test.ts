import '@abraham/reflection'
import { container as globalContainer, DependencyContainer } from 'tsyringe'
import { formatFirstDayOfThisWeek, getFirstDayOfThisWeek } from '@/lib/logic/utils/dateUtilities'
import { addMilliseconds, startOfDay, startOfWeek } from 'date-fns'
import DbHandler from '@/lib/logic/app/DbHandler'
import NewWeekPromptHandler from '@/lib/logic/app/NewWeekPromptHandler'
import initializeHabitsHandler from '@/test-setup/initializeHabitsHandler'
import deleteWeeks from '@/test-setup/deleteWeeks'
import signInDummyUser from '@/test-setup/signIn'
import MockDate from 'mockdate'
import addWeeks from 'date-fns/addWeeks'

// 🔨

let testContainer: DependencyContainer
let newWeekPromptHandler: NewWeekPromptHandler, dbHandler: DbHandler

async function setup() {
  testContainer = globalContainer.createChildContainer()
  await initializeHabitsHandler(testContainer)
  dbHandler = testContainer.resolve(DbHandler)
}

function initialize() {
  newWeekPromptHandler = testContainer.resolve(NewWeekPromptHandler)
  newWeekPromptHandler.checkIsNewWeek()
}

beforeAll(async () => {
  await signInDummyUser()
})

afterEach(async () => {
  jest.useRealTimers()
  MockDate.reset()
  await deleteWeeks()
})

// 🧪

describe('initialization', () => {
  test('it stores the start of the current week correctly', async () => {
    await setup()
    initialize()
    expect(newWeekPromptHandler.thisWeekStartDate).toEqual(getFirstDayOfThisWeek())
  })

  test('sets a timeout for the beginning of next Monday', async () => {
    // 8:30 AM on September 27 2021
    const date = addMilliseconds(startOfDay(new Date('Mon Sep 27 2021')), 30600000)
    MockDate.set(date)

    await setup()
    jest.useFakeTimers('legacy')
    initialize()

    // Timeout length should be the difference between now and the beginning of next Monday
    const timeoutTimeMs = (setTimeout as any).mock.calls[0][1]
    expect(timeoutTimeMs).toEqual(574200000)
    jest.runOnlyPendingTimers()
  })

  test('if the last tracked week is this week in real time, showPrompt initializes to false', async () => {
    await dbHandler.updateWeekDoc(formatFirstDayOfThisWeek(), {})
    await setup()
    initialize()
    expect(newWeekPromptHandler.showPrompt).toEqual(false)
  })

  test('if the last tracked week is a week in the past, showPrompt initializes to true', async () => {
    await dbHandler.updateWeekDoc('2021-08-16', {})
    await setup()
    initialize()
    expect(newWeekPromptHandler.showPrompt).toEqual(true)
  })
})

describe('timeout behavior', () => {
  test(`after the timeout completes and the next week has started, stored value of this week's start date refreshes, and showPrompt is true`, async () => {
    const date = startOfDay(new Date('Mon Sep 20 2021'))
    MockDate.set(date)

    await setup()
    jest.useFakeTimers('legacy')
    initialize()

    MockDate.set(startOfDay(addWeeks(date, 1)))
    jest.runOnlyPendingTimers()
    expect(newWeekPromptHandler.showPrompt).toEqual(true)
    expect(newWeekPromptHandler.thisWeekStartDate).toEqual(startOfWeek(new Date(), { weekStartsOn: 1 }))
  })

  test(`after the timeout completes, another one starts for the following Monday`, async () => {
    const date = addMilliseconds(startOfDay(new Date('Mon Sep 27 2021')), 30600000)
    MockDate.set(date)

    await setup()
    jest.useFakeTimers('legacy')
    initialize()

    MockDate.set(startOfDay(addWeeks(date, 1)))
    jest.runOnlyPendingTimers()
    const secondTimeoutTimeMs = (setTimeout as any).mock.calls[1][1]
    expect(secondTimeoutTimeMs).toEqual(604800000)
  })
})