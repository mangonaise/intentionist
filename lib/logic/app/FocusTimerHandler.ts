import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'
import { formatFirstDayOfThisWeek } from '../utils/dateUtilities'
import HabitsHandler, { Habit } from './HabitsHandler'
import WeekHandler, { WeekdayId } from './WeekHandler'
import getCurrentWeekdayId from '../utils/getCurrentWeekdayId'

export type TimerStatus = 'not started' | 'playing' | 'paused' | 'finished'

@injectable()
export default class FocusTimerHandler {
  public selectedHabit: Habit | undefined
  public activeHabits: Habit[]
  public duration = 1500
  public progress = 0
  public status: TimerStatus = 'not started'
  public weekdayId: WeekdayId = 0
  private countdownInterval?: NodeJS.Timeout
  private endSound?: HTMLAudioElement
  private weekHandler

  constructor(habitsHandler: HabitsHandler, weekHandler: WeekHandler) {
    this.weekHandler = weekHandler
    this.activeHabits = habitsHandler.habits.filter((habit) => habit.status === 'active')
    if (this.activeHabits.length) this.selectedHabit = this.activeHabits[0]
    this.ensureViewingLatestWeek()
    makeAutoObservable(this)
  }

  public getTimeSpentThisWeek = (weekday: WeekdayId) => {
    if (!this.selectedHabit) return 0
    if (this.weekHandler.weekInView.startDate === formatFirstDayOfThisWeek()) {
      return this.weekHandler.weekInView?.times?.[this.selectedHabit.id]?.[weekday] ?? 0
    }
    return 0
  }

  public selectHabit = (habit: Habit) => {
    this.selectedHabit = habit
  }

  public setDuration = (seconds: number) => {
    this.duration = Math.max(0, Math.min(seconds, 43200))
  }

  public addDuration = (seconds: number) => {
    this.setDuration(this.duration + seconds)
  }

  public startTimer = () => {
    if (this.status === 'not started') {
      this.progress = 0
      const weekStartDate = formatFirstDayOfThisWeek()
      if (weekStartDate !== this.weekHandler.weekInView.startDate) {
        this.weekHandler.viewWeek(weekStartDate)
      }
    }
    this.status = 'playing'
    this.weekdayId = getCurrentWeekdayId()
    const previousProgress = this.progress
    const startTimeMs = new Date().getTime()
    this.countdownInterval = setInterval(() => {
      runInAction(() => {
        this.progress = previousProgress + Math.floor((new Date().getTime() - startTimeMs) / 1000)
        this.progress = Math.min(this.progress, this.duration)
      })
      if (this.progress >= this.duration) {
        this.handleTimerEnd()
      }
    }, 1000)
  }

  public pauseTimer = () => {
    this.clearCountdownInterval()
    this.status = 'paused'
  }

  public stopTimer = () => {
    if (this.status !== 'finished') {
      this.saveProgress()
    }
    this.clearCountdownInterval()
    this.status = 'not started'
    this.progress = 0
    this.endSound?.pause()
  }

  private handleTimerEnd = () => {
    this.saveProgress()
    this.clearCountdownInterval()
    this.status = 'finished'
    this.playEndSound()
  }

  private playEndSound = () => {
    if (typeof window === 'undefined') return
    if (!this.endSound) {
      this.endSound = new Audio('/audio/timer1.mp3')
    }
    this.endSound.currentTime = 0
    this.endSound.play()
    this.endSound.loop = true
  }

  private saveProgress = () => {
    if (!this.selectedHabit) return
    this.weekHandler.addFocusedTime(this.selectedHabit?.id, this.weekdayId, this.progress)
  }

  private clearCountdownInterval() {
    if (this.countdownInterval) clearInterval(this.countdownInterval)
  }

  private ensureViewingLatestWeek() {
    if (this.weekHandler.weekInView.startDate !== this.weekHandler.latestWeekStartDate) {
      this.weekHandler.viewWeek(this.weekHandler.latestWeekStartDate)
    }
  }
}