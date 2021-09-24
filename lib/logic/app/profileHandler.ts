import { makeAutoObservable, runInAction } from 'mobx'
import authHandler from './authHandler'
import dbHandler from './dbHandler'

export type ProfileInfo = {
  displayName: string
}

class ProfileHandler {
  private static instance: ProfileHandler
  public profileInfo: ProfileInfo | null | undefined

  private constructor() {
    makeAutoObservable(this)
  }

  public fetchUserProfile = async () => {
    if (this.profileInfo !== undefined) return
    const userDoc = await dbHandler().getUserDoc()
    runInAction(() => this.profileInfo = userDoc?.profile || null)
  }

  public updateUserProfile = async (info: ProfileInfo) => {
    this.profileInfo = info
    await dbHandler().updateUserDoc('', { profile: info })
  }

  public static getInstance = () => {
    if (!ProfileHandler.instance) {
      if (!authHandler.user) throw new Error('Should not be instantiating profile handler when unauthenticated.')
      ProfileHandler.instance = new ProfileHandler()
    }
    return ProfileHandler.instance
  }
}

const profileHandler = () => ProfileHandler.getInstance()
export default profileHandler