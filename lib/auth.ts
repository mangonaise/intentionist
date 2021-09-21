import { firebaseApp } from './firebase';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth'
import { makeAutoObservable } from 'mobx';

const firebaseAuth = getAuth(firebaseApp)
const isBrowser = typeof window !== 'undefined'

class AuthHandler {
  user: User | null = null

  constructor() {
    onAuthStateChanged(firebaseAuth, (user) => this.setUser(user))
    makeAutoObservable(this)
  }

  public get cachedAuthState() {
    if (!isBrowser) return false
    return !!localStorage.getItem('authState')
  }

  public async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: "select_account" })
      await signInWithPopup(firebaseAuth, provider)
    } catch (error) {
      console.error(error)
    }
  }

  public async handleSignOut() {
    await signOut(firebaseAuth)
  }

  private setUser(user: User | null) {
    this.setCachedAuthState(!!user)
    this.user = user
  }

  private setCachedAuthState(authState: boolean) {
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