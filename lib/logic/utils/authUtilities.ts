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
    onAuthStateChanged(auth, (user) => this.setUser(user))
    makeAutoObservable(this)
  }

  public get cached() {
    if (!isBrowser) return false
    return !!localStorage.getItem('authState')
  }

  private setUser = (user: User | null) => {
    this.setCachedAuthState(!!user)
    this.current = !!user
  }

  private setCachedAuthState = (authState: boolean) => {
    if (!isBrowser) return
    if (authState) {
      localStorage.setItem('authState', '1')
    } else {
      localStorage.removeItem('authState')
    }
  }
})