import { makeAutoObservable, runInAction } from 'mobx'
import { inject, injectable } from 'tsyringe'
import HabitsHandler, { Habit } from '@/logic/app/HabitsHandler'
import WeekHandler, { WeekdayId } from '@/logic/app/WeekHandler'
import { formatFirstDayOfThisWeek } from '@/logic/utils/dateUtilities'
import getCurrentWeekdayId from '@/logic/utils/getCurrentWeekdayId'
import Router from '@/types/router'

export type TimerStatus = 'not started' | 'playing' | 'paused' | 'finished'

type QueryParams = { habitId: string }

@injectable()
export default class FocusTimerHandler {
  public selectedHabit: Habit | undefined
  public timeableHabits: Habit[]
  public duration = 1500
  public progress = 0
  public status: TimerStatus = 'not started'
  public weekdayId: WeekdayId = 0
  private countdownInterval?: NodeJS.Timeout
  private endSound?: HTMLAudioElement
  private weekHandler

  constructor(habitsHandler: HabitsHandler, weekHandler: WeekHandler, @inject('Router') router: Router) {
    this.weekHandler = weekHandler
    this.timeableHabits = habitsHandler.habits.filter((habit) => habit.timeable && habit.status === 'active')

    const query = router.query as QueryParams
    if (query.habitId) {
      this.selectedHabit = habitsHandler.habits.find((habit) => habit.id === query.habitId)
    }

    this.ensureViewingLatestWeek()

    if (typeof window !== 'undefined') {
      this.endSound = new Audio('/audio/timer1.mp3')
    }

    makeAutoObservable(this)
  }

  public getIsUntrackedWeek = () => {
    return formatFirstDayOfThisWeek() !== this.weekHandler.weekInView.startDate
  }

  public getTimeSpentThisWeek = (period: WeekdayId | 'all') => {
    if (!this.selectedHabit) return 0
    if (this.weekHandler.weekInView.startDate === formatFirstDayOfThisWeek()) {
      return this.weekHandler.getFocusedTime(this.selectedHabit.id, period === 'all' ? 'week' : period)
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
    if (!this.selectedHabit) return
    if (this.status === 'not started') {
      this.progress = 0
      const weekStartDate = formatFirstDayOfThisWeek()
      if (this.getIsUntrackedWeek()) {
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

  public exitTimer = () => {
    this.clearCountdownInterval()
    this.endSound?.pause()
  }

  private handleTimerEnd = () => {
    this.saveProgress()
    this.clearCountdownInterval()
    this.status = 'finished'
    this.playEndSound()
  }

  private playEndSound = () => {
    if (!this.endSound) return
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