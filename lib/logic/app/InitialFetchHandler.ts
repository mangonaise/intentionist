import type { HabitsDocumentData } from '@/logic/app/HabitsHandler'
import type { WeekDocumentData } from '@/logic/app/WeekHandler'
import type { UserProfileInfo } from '@/logic/app/ProfileHandler'
import { makeAutoObservable, runInAction } from 'mobx'
import { singleton } from 'tsyringe'
import DbHandler from '@/logic/app/DbHandler'

export type Fetched<T> = T | null

type InitialFetches = {
  userProfile: Fetched<UserProfileInfo>
  habitsDoc: Fetched<HabitsDocumentData>,
  latestWeekDoc: Fetched<WeekDocumentData>
}

@singleton()
export default class InitialFetchHandler {
  private dbHandler
  public initialFetches: InitialFetches | undefined
  public hasCompletedInitialFetches = false

  constructor(dbHandler: DbHandler) {
    this.dbHandler = dbHandler
    this.makeInitialFetches()
    makeAutoObservable(this)
  }

  private makeInitialFetches = async () => {
    const results = await Promise.all([
      this.fetchUserProfile(),
      this.fetchHabitsDoc(),
      this.fetchLatestWeekDoc()
    ])
    runInAction(() => {
      this.initialFetches = {
        userProfile: results[0],
        habitsDoc: results[1],
        latestWeekDoc: results[2]
      }
      this.hasCompletedInitialFetches = true
    })
  }

  private fetchUserProfile = async () => {
    const userDoc = await this.dbHandler.getDocData(this.dbHandler.userDocRef())
    return userDoc ? userDoc as UserProfileInfo : null
  }

  private fetchHabitsDoc = async () => {
    const habitsDoc = await this.dbHandler.getDocData(this.dbHandler.habitsDocRef)
    return habitsDoc ? habitsDoc as HabitsDocumentData : null
  }

  private fetchLatestWeekDoc = async () => {
    const weekDoc = await this.dbHandler.getLatestWeekDoc()
    return weekDoc ? weekDoc : null
  }
}

@singleton()
export class InitialState {
  data: InitialFetches

  constructor(fetchHandler: InitialFetchHandler) {
    if (fetchHandler.initialFetches === undefined) {
      throw new Error('Cannot access initial app state before fetching is complete.')
    }
    this.data = fetchHandler.initialFetches
  }
}