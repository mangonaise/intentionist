import type { HabitProperties } from './HabitsHandler'
import { makeAutoObservable, runInAction } from 'mobx'
import { Lifecycle, scoped } from 'tsyringe'
import DbHandler from './DbHandler'

type Fetched<T> = T | null

type InitialFetches = {
  userProfile: Fetched<ProfileInfo>
  habitsDoc: Fetched<HabitsDocumentData>
}

type ProfileInfo = {
  displayName: string
}

type HabitsDocumentData = {
  habits: { [id: string]: HabitProperties },
  order: string[]
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
      this.fetchHabitsDoc()
    ])
    runInAction(() => {
      this.initialFetches = {
        userProfile: results[0],
        habitsDoc: results[1],
      }
      this.hasCompletedInitialFetches = true
    })
  }

  private fetchUserProfile = async () => {
    const userDoc = await this.dbHandler.getUserDoc()
    const profile = userDoc?.profile
    return profile ? profile as ProfileInfo : null
  }

  private fetchHabitsDoc = async () => {
    const habitsDoc = await this.dbHandler.getUserDoc('data', 'habits')
    return habitsDoc ? habitsDoc as HabitsDocumentData : null
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