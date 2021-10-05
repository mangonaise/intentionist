import { makeAutoObservable, runInAction } from 'mobx';
import { Lifecycle, scoped } from 'tsyringe';
import { HabitProperties } from './HabitsHandler';
import DbHandler from './DbHandler';

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
  public hasCompletedInitialFetches = false
  public initialFetches = {
    userProfile: undefined as ProfileInfo | null | undefined,
    habitsDoc: undefined as HabitsDocumentData | null | undefined
  }

  constructor(dbHandler: DbHandler) {
    this.dbHandler = dbHandler
    this.makeInitialFetches()
    makeAutoObservable(this)
  }

  private makeInitialFetches = async () => {
    this.hasCompletedInitialFetches = false
    const results = await Promise.all([
      this.fetchUserProfile(),
      this.fetchHabits()
    ])
    runInAction(() => {
      this.initialFetches = {
        userProfile: results[0],
        habitsDoc: results[1]
      }
      this.hasCompletedInitialFetches = true
    })
  }

  private fetchUserProfile = async () => {
    const userDoc = await this.dbHandler.getUserDoc()
    const profile = userDoc?.profile
    return profile ? profile as ProfileInfo : null
  }

  private fetchHabits = async () => {
    const habitsDoc = await this.dbHandler.getUserDoc('data', 'habits')
    return habitsDoc ? habitsDoc as HabitsDocumentData : null
  }
}

@scoped(Lifecycle.ContainerScoped)
export class InitialState {
  userProfile: ProfileInfo | null
  habitsDoc: HabitsDocumentData | null

  constructor(fetchHandler: InitialFetchHandler) {
    if (!fetchHandler.hasCompletedInitialFetches) {
      throw new Error('Cannot access initial app state before fetching is complete.')
    }
    const { userProfile, habitsDoc } = fetchHandler.initialFetches
    this.userProfile = userProfile!
    this.habitsDoc = habitsDoc!
  }
}