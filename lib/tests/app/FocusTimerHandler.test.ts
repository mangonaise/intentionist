import '@abraham/reflection'
import { container } from 'tsyringe'
import FocusTimerHandler from '@/lib/logic/app/FocusTimerHandler'

// 🔨

let timerHandler: FocusTimerHandler

beforeEach(() => {
  timerHandler = container.resolve(FocusTimerHandler)
  jest.useFakeTimers()
})

afterEach(() => {
  jest.useRealTimers()
})

// 🧪

test('status is initially set to "not started"', () => {
  expect(timerHandler.status).toEqual('not started')
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