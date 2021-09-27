import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth'
import { makeAutoObservable } from 'mobx'
import { auth } from '../../firebase'

const isBrowser = typeof window !== 'undefined'

export async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: "select_account" })
    await signInWithPopup(auth, provider)
  } catch (error) {
    console.error(error)
  }
}

export async function handleSignOut() {
  await signOut(auth)
}

export const authState = new (class {
  current = false

  constructor() {
    onAuthStateChanged(auth, (user) => this.setCurrentState(!!user))
    makeAutoObservable(this)
  }

  private setCurrentState = (state: boolean) => {
    this.current = state
    if (!isBrowser) return
    if (state) {
      localStorage.setItem('authState', '1')
    } else {
      localStorage.removeItem('authState')
    }
  }

  public getCachedState() {
    if (!isBrowser) return false
    return !!localStorage.getItem('authState')
  }
})