import '@abraham/reflection'
import { container } from 'tsyringe'
import { addMilliseconds, startOfDay, startOfWeek } from 'date-fns'
import { formatFirstDayOfThisWeek, getFirstDayOfThisWeek } from '@/logic/utils/dateUtilities'
import initializeFirebase, { registerFirebaseInjectionTokens } from '@/firebase-setup/initializeFirebase'
import WeekHandler from '@/logic/app/WeekHandler'
import NewWeekPromptHandler from '@/logic/app/NewWeekPromptHandler'
import deleteWeeks from '@/test-setup/deleteWeeks'
import simulateInitialFetches from '@/test-setup/simulateInitialFetches'
import signInDummyUser from '@/test-setup/signInDummyUser'
import teardownFirebase from '@/test-setup/teardownFirebase'
import MockDate from 'mockdate'
import addWeeks from 'date-fns/addWeeks'

// 🔨

const firebase = initializeFirebase('test-newweekprompthandler')

let newWeekPromptHandler: NewWeekPromptHandler

function startNewWeekPromptHandler() {
  newWeekPromptHandler = container.resolve(NewWeekPromptHandler)
  newWeekPromptHandler.checkIsNewWeek()
}

beforeAll(async () => {
  await signInDummyUser()
})

beforeEach(async () => {
  registerFirebaseInjectionTokens(firebase)
  await simulateInitialFetches()
})

afterEach(async () => {
  jest.useRealTimers()
  MockDate.reset()
  await deleteWeeks()
  container.clearInstances()
})

afterAll(async () => {
  await teardownFirebase(firebase)
})

// 🧪

describe('initialization', () => {
  test('it stores the start of the current week correctly', async () => {
    startNewWeekPromptHandler()
    expect(newWeekPromptHandler.thisWeekStartDate).toEqual(getFirstDayOfThisWeek())
  })

  test('sets a timeout for the beginning of next Monday', async () => {
    // 8:30 AM on September 27 2021
    const date = addMilliseconds(startOfDay(new Date('Mon Sep 27 2021')), 30600000)
    MockDate.set(date)

    jest.useFakeTimers('legacy')
    startNewWeekPromptHandler()

    // Timeout length should be the difference between now and the beginning of next Monday
    const timeoutTimeMs = (setTimeout as any).mock.calls[0][1]
    expect(timeoutTimeMs).toEqual(574200000)
    jest.runOnlyPendingTimers()
  })

  test('if the latest tracked week is this week in real time, showPrompt initializes to false', async () => {
    container.resolve(WeekHandler).latestWeekStartDate = formatFirstDayOfThisWeek()
    startNewWeekPromptHandler()
    expect(newWeekPromptHandler.showPrompt).toEqual(false)
  })

  test('if the latest tracked week is a week in the past, showPrompt initializes to true', async () => {
    container.resolve(WeekHandler).latestWeekStartDate = '2021-08-16'
    startNewWeekPromptHandler()
    expect(newWeekPromptHandler.showPrompt).toEqual(true)
  })
})

describe('timeout behavior', () => {
  test(`after the timeout completes and the next week has started, stored value of this week's start date refreshes, and showPrompt is true`, async () => {
    const date = startOfDay(new Date('Mon Sep 20 2021'))
    MockDate.set(date)

    jest.useFakeTimers('legacy')
    startNewWeekPromptHandler()

    MockDate.set(startOfDay(addWeeks(date, 1)))
    jest.runOnlyPendingTimers()
    expect(newWeekPromptHandler.showPrompt).toEqual(true)
    expect(newWeekPromptHandler.thisWeekStartDate).toEqual(startOfWeek(new Date(), { weekStartsOn: 1 }))
  })

  test(`after the timeout completes, another one starts for the following Monday`, async () => {
    const date = addMilliseconds(startOfDay(new Date('Mon Sep 27 2021')), 30600000)
    MockDate.set(date)

    jest.useFakeTimers('legacy')
    startNewWeekPromptHandler()

    MockDate.set(startOfDay(addWeeks(date, 1)))
    jest.runOnlyPendingTimers()
    const secondTimeoutTimeMs = (setTimeout as any).mock.calls[1][1]
    expect(secondTimeoutTimeMs).toEqual(604800000)
  })
})