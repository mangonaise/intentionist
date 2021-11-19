import type { Habit, HabitDetailsDocumentData } from '@/logic/app/HabitsHandler'
import type { UserProfileInfo } from '@/logic/app/ProfileHandler'
import { makeAutoObservable, runInAction } from 'mobx'
import { singleton } from 'tsyringe'
import DbHandler from '@/logic/app/DbHandler'
import FriendsHandler from '@/logic/app/FriendsHandler'

export type Fetched<T> = T | null

type InitialFetches = {
  userProfile: Fetched<UserProfileInfo>
  activeHabitsDocs: Habit[],
  habitDetailsDoc: Fetched<HabitDetailsDocumentData>
}

@singleton()
export default class InitialFetchHandler {
  private dbHandler
  public initialFetches: InitialFetches | undefined
  public hasCompletedInitialFetches = false

  constructor(dbHandler: DbHandler, friendsHandler: FriendsHandler) {
    this.dbHandler = dbHandler
    this.makeInitialFetches()
    friendsHandler.listenToFriendsDoc()
    makeAutoObservable(this)
  }

  private makeInitialFetches = async () => {
    const results = await Promise.all([
      this.fetchUserProfile(),
      this.fetchActiveHabitsDocs(),
      this.fetchHabitDetailsDoc()
    ])
    runInAction(() => {
      this.initialFetches = {
        userProfile: results[0],
        activeHabitsDocs: results[1],
        habitDetailsDoc: results[2]
      }
      this.hasCompletedInitialFetches = true
    })
  }

  private fetchUserProfile = async () => {
    const userDoc = await this.dbHandler.getDocData(this.dbHandler.userDocRef())
    return userDoc ? userDoc as UserProfileInfo : null
  }

  private fetchActiveHabitsDocs = async () => {
    const activeHabitsDocs = await this.dbHandler.getActiveHabitsDocs()
    return activeHabitsDocs
  }

  private fetchHabitDetailsDoc = async () => {
    const habitDetailsDoc = await this.dbHandler.getHabitDetailsDoc()
    return habitDetailsDoc ? habitDetailsDoc as HabitDetailsDocumentData : null
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