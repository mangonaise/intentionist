import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth'
import { makeAutoObservable } from 'mobx';
import { auth } from '../../firebase';

const isBrowser = typeof window !== 'undefined'

class AuthHandler {
  user: User | null = null

  constructor() {
    onAuthStateChanged(auth, (user) => this.setUser(user))
    makeAutoObservable(this)
  }

  public get cachedAuthState() {
    if (!isBrowser) return false
    return !!localStorage.getItem('authState')
  }

  public signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: "select_account" })
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error(error)
    }
  }

  public handleSignOut = async () => {
    await signOut(auth)
  }

  private setUser = (user: User | null) => {
    this.setCachedAuthState(!!user)
    this.user = user
  }

  private setCachedAuthState = (authState: boolean) => {
    if (!isBrowser) return
    if (authState) {
      localStorage.setItem('authState', '1')
    } else {
      localStorage.removeItem('authState')
    }
  }
}

const authHandler = new AuthHandler()
export default authHandler