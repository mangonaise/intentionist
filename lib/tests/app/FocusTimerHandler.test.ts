import '@abraham/reflection'
import { container } from 'tsyringe'
import { subWeeks } from 'date-fns'
import { formatFirstDayOfThisWeek, formatYYYYMMDD, getFirstDayOfThisWeek } from '@/logic/utils/dateUtilities'
import initializeFirebase from '@/firebase-setup/initializeFirebase'
import HabitsHandler, { Habit } from '@/logic/app/HabitsHandler'
import FocusTimerHandler from '@/logic/app/FocusTimerHandler'
import WeekHandler from '@/logic/app/WeekHandler'
import generateHabitId from '@/logic/utils/generateHabitId'
import getCurrentWeekdayId from '@/logic/utils/getCurrentWeekdayId'
import DbHandler from '@/logic/app/DbHandler'
import MockDate from 'mockdate'
import MockRouter from '@/test-setup/mock/MockRouter'
import signInDummyUser from '@/test-setup/signInDummyUser'
import deleteWeeks from '@/test-setup/deleteWeeks'
import deleteHabitsDoc from '@/test-setup/deleteHabitsDoc'
import simulateInitialFetches from '@/test-setup/simulateInitialFetches'
import teardownFirebase from '@/test-setup/teardownFirebase'
import addWeeks from 'date-fns/addWeeks'

// 🔨

const firebase = initializeFirebase('test-focustimerhandler')

const router = container.resolve(MockRouter)
container.register('Router', { useValue: router })

let timerHandler: FocusTimerHandler, habitsHandler: HabitsHandler
const dummyHabit: Habit = { id: generateHabitId(), name: 'Focus timer test habit', icon: '⏲', status: 'active' }

beforeAll(async () => {
  await signInDummyUser()
  await simulateInitialFetches()
  habitsHandler = container.resolve(HabitsHandler)
})

afterAll(async () => {
  await deleteHabitsDoc()
  await teardownFirebase(firebase)
})

// 🧪

describe('initialization', () => {
  test('if the week in view is not the latest week, the week in view is automatically set to the latest week', async () => {
    const weekHandler = container.resolve(WeekHandler)
    await weekHandler.viewWeek('2021-10-04')
    timerHandler = container.resolve(FocusTimerHandler)
    expect(weekHandler.weekInView.startDate).toEqual(formatFirstDayOfThisWeek())
  })

  test('status is initially set to "not started"', () => {
    timerHandler = container.resolve(FocusTimerHandler)
    expect(timerHandler.status).toEqual('not started')
  })

  test('if query parameter habitId is supplied, initialize with the corresponding habit already selected', async () => {
    await habitsHandler.setHabit(dummyHabit)
    router.setQuery({ habitId: dummyHabit.id })
    timerHandler = container.resolve(FocusTimerHandler)
    expect(timerHandler.selectedHabit).toEqual(dummyHabit)
  })

  test('if no habitId is supplied in query, the initially selected habit is undefined', () => {
    router.setQuery({})
    timerHandler = container.resolve(FocusTimerHandler)
    expect(timerHandler.selectedHabit).toBeUndefined()
  })
})

describe('behavior', () => {
  beforeEach(() => {
    timerHandler = container.resolve(FocusTimerHandler)
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('duration in seconds can be set', () => {
    timerHandler.setDuration(300)
    expect(timerHandler.duration).toEqual(300)
  })

  test('duration in seconds can be added', () => {
    timerHandler.setDuration(0)
    timerHandler.addDuration(3000)
    expect(timerHandler.duration).toBe(3000)
  })

  test('after starting the timer, status is set to "playing"', () => {
    timerHandler.selectHabit(dummyHabit)
    timerHandler.setDuration(300)
    timerHandler.startTimer()
    expect(timerHandler.status).toEqual('playing')
  })

  test('progress is equal to the time elapsed since the timer started in seconds', () => {
    timerHandler.selectHabit(dummyHabit)
    timerHandler.setDuration(1500)
    timerHandler.startTimer()
    jest.advanceTimersByTime(60000)
    expect(timerHandler.progress).toEqual(60)
  })

  test('when the timer completes, status is set to "finished"', () => {
    timerHandler.selectHabit(dummyHabit)
    timerHandler.setDuration(300)
    timerHandler.startTimer()
    jest.runAllTimers()
    expect(timerHandler.status).toEqual('finished')
  })

  test('when the timer completes, progress is equal to duration', () => {
    timerHandler.selectHabit(dummyHabit)
    timerHandler.setDuration(600)
    timerHandler.startTimer()
    jest.runAllTimers()
    expect(timerHandler.progress).toEqual(timerHandler.duration)
  })

  test('when the timer is paused, status is set to "paused"', () => {
    timerHandler.setDuration(300)
    timerHandler.startTimer()
    jest.advanceTimersByTime(1000)
    timerHandler.pauseTimer()
    expect(timerHandler.status).toEqual('paused')
  })

  test('when the timer is paused, progress is equal to how many seconds have elapsed so far', () => {
    timerHandler.selectHabit(dummyHabit)
    timerHandler.setDuration(600)
    timerHandler.startTimer()
    jest.advanceTimersByTime(300000)
    timerHandler.pauseTimer()
    expect(timerHandler.progress).toEqual(300)
  })

  test('when the timer is paused, the timeout is cleared', () => {
    timerHandler.selectHabit(dummyHabit)
    timerHandler.setDuration(600)
    timerHandler.startTimer()
    jest.advanceTimersByTime(300000)
    timerHandler.pauseTimer()
    // Running all timers has no effect because there isn't one to run
    jest.runAllTimers()
    expect(timerHandler.progress).toEqual(300)
  })

  test('when the timer is stopped, status is reset to "not started"', () => {
    timerHandler.setDuration(1500)
    timerHandler.startTimer()
    timerHandler.stopTimer()
    expect(timerHandler.status).toEqual('not started')
  })

  test('when the timer is stopped, progress is set to 0', () => {
    timerHandler.setDuration(600)
    timerHandler.startTimer()
    timerHandler.stopTimer()
    expect(timerHandler.progress).toEqual(0)
  })

  describe('saving progress', () => {
    let weekHandler: WeekHandler

    beforeAll(async () => {
      weekHandler = container.resolve(WeekHandler)
      weekHandler.weekInView.times = {}
      await deleteWeeks()
    })

    beforeEach(() => {
      weekHandler = container.resolve(WeekHandler)
      weekHandler.weekInView.times = {}
    })

    afterEach(async () => {
      jest.useRealTimers()
      weekHandler.weekInView.times = {}
      await deleteWeeks()
    })

    test('progress is saved when the timer completes', async () => {
      timerHandler.selectHabit(dummyHabit)
      timerHandler.setDuration(3000)
      timerHandler.startTimer()
      jest.runAllTimers()

      jest.useRealTimers()
      expect(weekHandler.weekInView.times?.[dummyHabit.id]?.[getCurrentWeekdayId()]).toEqual(3000)
      const weekDoc = await container.resolve(DbHandler).getWeekDoc(formatFirstDayOfThisWeek())
      expect(weekDoc?.times?.[dummyHabit.id]?.[getCurrentWeekdayId()]).toEqual(3000)
    })

    test('partial progress is saved when the timer is stopped', async () => {
      timerHandler.selectHabit(dummyHabit)
      timerHandler.setDuration(3000)
      timerHandler.startTimer()
      jest.advanceTimersByTime(1000000)
      timerHandler.stopTimer()

      jest.useRealTimers()
      expect(weekHandler.weekInView.times?.[dummyHabit.id]?.[getCurrentWeekdayId()]).toEqual(1000)
      const weekDoc = await container.resolve(DbHandler).getWeekDoc(formatFirstDayOfThisWeek())
      expect(weekDoc?.times?.[dummyHabit.id]?.[getCurrentWeekdayId()]).toEqual(1000)
    })

    test(`if the timer is started on a week that doesn't exist yet, a new week will be created for the progress to be saved in`, async () => {
      const lastWeekStartDate = formatYYYYMMDD(subWeeks(getFirstDayOfThisWeek(), 1))
      weekHandler.latestWeekStartDate = lastWeekStartDate
      weekHandler.viewWeek(lastWeekStartDate)

      timerHandler.selectHabit(dummyHabit)
      timerHandler.setDuration(3000)

      // Week start date will automatically be switched
      expect(weekHandler.weekInView.startDate).toEqual(lastWeekStartDate)
      timerHandler.startTimer()
      expect(weekHandler.weekInView.startDate).toEqual(formatFirstDayOfThisWeek())

      jest.runAllTimers()
      jest.useRealTimers()
      expect(weekHandler.weekInView.times?.[dummyHabit.id]?.[getCurrentWeekdayId()]).toEqual(3000)
      const weekDoc = await container.resolve(DbHandler).getWeekDoc(formatFirstDayOfThisWeek())
      expect(weekDoc?.times?.[dummyHabit.id]?.[getCurrentWeekdayId()]).toEqual(3000)
    })

    test('after progress is saved, reports the correct amount of time spent on a habit on the current day', () => {
      timerHandler.selectHabit(dummyHabit)
      timerHandler.setDuration(300)
      timerHandler.startTimer()
      jest.runAllTimers()
      expect(timerHandler.getTimeSpentThisWeek(getCurrentWeekdayId())).toEqual(300)
    })

    test('if the present week is ahead of the latest week with data, report that no time was spent, regardless of data in the latest week', async () => {
      timerHandler.selectHabit(dummyHabit)
      timerHandler.setDuration(2500)
      timerHandler.startTimer()
      jest.runAllTimers()
      jest.useRealTimers()

      expect(timerHandler.getTimeSpentThisWeek(getCurrentWeekdayId())).toEqual(2500)
      MockDate.set(addWeeks(new Date(), 1))
      expect(timerHandler.getTimeSpentThisWeek(getCurrentWeekdayId())).toEqual(0)
    })
  })
})