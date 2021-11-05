import type { Auth } from '@firebase/auth'
import type { Firestore } from '@firebase/firestore'
import { container } from 'tsyringe'
import { initializeApp } from '@firebase/app'
import { connectAuthEmulator, getAuth } from '@firebase/auth'
import { connectFirestoreEmulator, getFirestore } from '@firebase/firestore'

const consoleInfo = console.info

export default function initializeFirebase(projectId = 'intentionist') {
  const firebaseConfig = {
    projectId,
    apiKey: 'AIzaSyCfjsR8D8fm-na_IVemInUmEiGerYcSblk',
    authDomain: 'intentionist.firebaseapp.com',
    storageBucket: 'intentionist.appspot.com'
  }

  const firebaseApp = initializeApp(firebaseConfig)
  const auth = getAuth(firebaseApp)
  const db = getFirestore(firebaseApp)

  if (typeof window === 'undefined' || window.location.hostname.includes('localhost')) {
    connectFirestoreEmulator(db, 'localhost', 8080)
    console.info = () => { }
    connectAuthEmulator(auth, 'http://localhost:9099')
    console.info = consoleInfo
  }

  registerFirebaseInjectionTokens({ auth, db })

  return {
    firebaseApp,
    auth,
    db
  }
}

export function registerFirebaseInjectionTokens({ auth, db }: { auth: Auth, db: Firestore }) {
  container.register('Auth', { useValue: auth })
  container.register('Db', { useValue: db })
}