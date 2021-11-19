import type { Habit } from '@/logic/app/HabitsHandler'
import type { UserProfileInfo } from '@/logic/app/ProfileHandler'
import { makeAutoObservable, runInAction } from 'mobx'
import { singleton } from 'tsyringe'
import DbHandler from '@/logic/app/DbHandler'
import FriendsHandler from '@/logic/app/FriendsHandler'

export type Fetched<T> = T | null

type InitialFetches = {
  userProfile: Fetched<UserProfileInfo>
  habitsDocs: Habit[]
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
      this.fetchHabitsDocs(),
    ])
    runInAction(() => {
      this.initialFetches = {
        userProfile: results[0],
        habitsDocs: results[1],
      }
      this.hasCompletedInitialFetches = true
    })
  }

  private fetchUserProfile = async () => {
    const userDoc = await this.dbHandler.getDocData(this.dbHandler.userDocRef())
    return userDoc ? userDoc as UserProfileInfo : null
  }

  private fetchHabitsDocs = async () => {
    console.warn('fetchHabitsDocs not implemented')
    return []
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