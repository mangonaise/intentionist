import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'

const consoleInfo = console.info

const firebaseConfig = {
  apiKey: 'AIzaSyCfjsR8D8fm-na_IVemInUmEiGerYcSblk',
  authDomain: 'intentionist.firebaseapp.com',
  projectId: 'intentionist',
  storageBucket: 'intentionist.appspot.com'
}

const firebaseApp = initializeApp(firebaseConfig)

export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)

if (typeof window === 'undefined' || window.location.hostname.includes('localhost')) {
  connectFirestoreEmulator(db, 'localhost', 8080)
  setShowAuthEmulatorWarning(false)
  connectAuthEmulator(auth, 'http://localhost:9099')
  setShowAuthEmulatorWarning(true)
}

function setShowAuthEmulatorWarning(show: boolean) {
  console.info = show ? consoleInfo : () => { }
}