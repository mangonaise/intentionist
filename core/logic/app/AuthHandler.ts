import type { Auth } from 'firebase/auth'
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { makeAutoObservable } from 'mobx'
import { inject, singleton } from 'tsyringe'

const isBrowser = typeof window !== 'undefined'

@singleton()
export default class AuthHandler {
  public auth
  public isAuthenticated = false

  constructor(@inject('Auth') auth: Auth) {
    this.auth = auth
    onAuthStateChanged(auth, (user) => this.setIsAuthenticated(!!user))
    makeAutoObservable(this)
  }

  public signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: "select_account" })
      await signInWithPopup(this.auth, provider)
    } catch (error) {
      console.error(error)
    }
  }

  public handleSignOut = async () => {
    await signOut(this.auth)
  }

  public getCachedAuthState() {
    if (!isBrowser) return false
    return !!localStorage.getItem('authState')
  }

  private setIsAuthenticated(state: boolean) {
    this.isAuthenticated = state
    if (!isBrowser) return
    if (state) {
      localStorage.setItem('authState', '1')
    } else {
      localStorage.removeItem('authState')
    }
  }
}