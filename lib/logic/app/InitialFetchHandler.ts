import type { HabitsDocumentData } from './HabitsHandler'
import type { WeekDocumentData } from './WeekHandler'
import type { UserProfileInfo } from './ProfileHandler'
import { makeAutoObservable, runInAction } from 'mobx'
import { Lifecycle, scoped } from 'tsyringe'
import DbHandler from './DbHandler'

export type Fetched<T> = T | null

type InitialFetches = {
  userProfile: Fetched<UserProfileInfo>
  habitsDoc: Fetched<HabitsDocumentData>,
  latestWeekDoc: Fetched<WeekDocumentData>
}

@scoped(Lifecycle.ContainerScoped)
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
    const userDoc = await this.dbHandler.getUserDoc()
    return userDoc ? userDoc as UserProfileInfo : null
  }

  private fetchHabitsDoc = async () => {
    const habitsDoc = await this.dbHandler.getUserDoc('data', 'habits')
    return habitsDoc ? habitsDoc as HabitsDocumentData : null
  }

  private fetchLatestWeekDoc = async () => {
    const weekDoc = await this.dbHandler.getLatestWeekDoc()
    return weekDoc ? weekDoc : null
  }
}

@scoped(Lifecycle.ContainerScoped)
export class InitialState {
  data: InitialFetches

  constructor(fetchHandler: InitialFetchHandler) {
    if (fetchHandler.initialFetches === undefined) {
      throw new Error('Cannot access initial app state before fetching is complete.')
    }
    this.data = fetchHandler.initialFetches
  }
}