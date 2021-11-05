import { container } from 'tsyringe'
import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'

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

  container.register('Auth', { useValue: auth })
  container.register('Db', { useValue: db })

  return {
    firebaseApp,
    auth,
    db
  }
}