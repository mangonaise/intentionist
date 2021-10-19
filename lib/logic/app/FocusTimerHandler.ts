import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

export type TimerStatus = 'not started' | 'playing' | 'paused' | 'finished'

@injectable()
export default class FocusTimerHandler {
  public duration = 1500
  public progress = 0
  public status: TimerStatus = 'not started'
  private countdownInterval?: NodeJS.Timeout
  private endSound?: HTMLAudioElement

  constructor() {
    makeAutoObservable(this)
  }

  public setDuration = (seconds: number) => {
    this.duration = Math.max(0, Math.min(seconds, 43200))
  }

  public addDuration = (seconds: number) => {
    this.setDuration(this.duration + seconds)
  }

  public startTimer = () => {
    if (this.status === 'not started') this.progress = 0
    this.status = 'playing'
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
    // todo: save progress if status !== 'finished'
    this.clearCountdownInterval()
    this.status = 'not started'
    this.progress = 0
    this.endSound?.pause()
  }

  private handleTimerEnd = () => {
    // todo: save progress
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

  private clearCountdownInterval() {
    if (this.countdownInterval) clearInterval(this.countdownInterval)
  }
}