import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from '@firebase/firestore'

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
  connectAuthEmulator(auth, 'http://localhost:9099')
  connectFirestoreEmulator(db, 'localhost', 8080)
}