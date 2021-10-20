import '@abraham/reflection'
import { container } from 'tsyringe'
import { subWeeks } from 'date-fns'
import { formatFirstDayOfThisWeek, formatYYYYMMDD, getFirstDayOfThisWeek } from '@/lib/logic/utils/dateUtilities'
import { Habit } from '@/lib/logic/app/HabitsHandler'
import FocusTimerHandler from '@/lib/logic/app/FocusTimerHandler'
import WeekHandler from '@/lib/logic/app/WeekHandler'
import generateHabitId from '@/lib/logic/utils/generateHabitId'
import getCurrentWeekdayId from '@/lib/logic/utils/getCurrentWeekdayId'
import DbHandler from '@/lib/logic/app/DbHandler'
import initializeHabitsHandler from '@/test-setup/initializeHabitsHandler'
import signInDummyUser from '@/test-setup/signIn'
import deleteWeeks from '@/test-setup/deleteWeeks'

// 🔨

let timerHandler: FocusTimerHandler
const dummyHabit: Habit = { id: generateHabitId(), name: 'Focus timer test habit', icon: '⏲', status: 'active' }

beforeAll(async () => {
  await signInDummyUser()
  await initializeHabitsHandler(container)
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
    timerHandler.setDuration(300)
    timerHandler.startTimer()
    expect(timerHandler.status).toEqual('playing')
  })

  test('progress is equal to the time elapsed since the timer started in seconds', () => {
    timerHandler.setDuration(1500)
    timerHandler.startTimer()
    jest.advanceTimersByTime(60000)
    expect(timerHandler.progress).toEqual(60)
  })

  test('when the timer completes, status is set to "finished"', () => {
    timerHandler.setDuration(300)
    timerHandler.startTimer()
    jest.runAllTimers()
    expect(timerHandler.status).toEqual('finished')
  })

  test('when the timer completes, progress is equal to duration', () => {
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
    timerHandler.setDuration(600)
    timerHandler.startTimer()
    jest.advanceTimersByTime(300000)
    timerHandler.pauseTimer()
    expect(timerHandler.progress).toEqual(300)
  })

  test('when the timer is paused, the timeout is cleared', () => {
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

    beforeEach(() => {
      weekHandler = container.resolve(WeekHandler)
    })

    afterEach(async () => {
      weekHandler.weekInView.times = {}
      await deleteWeeks()
    })

    test('progress is saved when the timer completes', async () => {
      timerHandler.selectHabit(dummyHabit)
      timerHandler.setDuration(3000)
      timerHandler.startTimer()
      jest.runAllTimers()
      timerHandler.setDuration(1500)
      timerHandler.startTimer()
      jest.runAllTimers()

      jest.useRealTimers()
      expect(weekHandler.weekInView.times?.[dummyHabit.id]?.[getCurrentWeekdayId()]).toEqual(4500)
      const weekDoc = await container.resolve(DbHandler).getWeekDoc(formatFirstDayOfThisWeek())
      expect(weekDoc?.times?.[dummyHabit.id]?.[getCurrentWeekdayId()]).toEqual(4500)
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
  })
})