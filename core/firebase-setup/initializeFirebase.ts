import type { Auth } from '@firebase/auth'
import type { Firestore } from '@firebase/firestore'
import type { Functions } from '@firebase/functions'
import { container } from 'tsyringe'
import { FirebaseApp, FirebaseOptions, initializeApp } from '@firebase/app'
import { initializeAppCheck, ReCaptchaV3Provider } from '@firebase/app-check'
import { connectAuthEmulator, getAuth } from '@firebase/auth'
import { connectFirestoreEmulator, getFirestore } from '@firebase/firestore'
import { connectFunctionsEmulator, getFunctions } from '@firebase/functions'

const consoleInfo = console.info

export type FirebaseServices = {
  app: FirebaseApp,
  auth: Auth,
  db: Firestore,
  functions: Functions
}

export default function initializeFirebase(projectId = 'intentionist') {
  const firebaseConfig: FirebaseOptions = {
    projectId,
    apiKey: 'AIzaSyCfjsR8D8fm-na_IVemInUmEiGerYcSblk',
    authDomain: 'intentionist.firebaseapp.com',
    storageBucket: 'intentionist.appspot.com',
    messagingSenderId: '643016629614',
    appId: '1:643016629614:web:ab6fb549e32a5450de357f'
  }

  const app = initializeApp(firebaseConfig)
  const auth = getAuth(app)
  const db = getFirestore(app)
  const functions = getFunctions(app)

  // EMULATOR
  if (typeof window === 'undefined' || window.location.hostname.includes('localhost')) {
    connectFirestoreEmulator(db, 'localhost', 8080)
    connectFunctionsEmulator(functions, 'localhost', 5001)
    console.info = () => { }
    connectAuthEmulator(auth, 'http://localhost:9099')
    console.info = consoleInfo
  }
  // PRODUCTION
  else {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider('6Le45WgdAAAAAMw2xYbr_48FTYU63iKyXd0uCek1'),
      isTokenAutoRefreshEnabled: true
    })
  }

  const firebase: FirebaseServices = {
    app,
    auth,
    db,
    functions
  }

  registerFirebaseInjectionTokens(firebase)

  return firebase
}

export function registerFirebaseInjectionTokens(firebase: FirebaseServices) {
  container.register('Auth', { useValue: firebase.auth })
  container.register('Firestore', { useValue: firebase.db })
  container.register('Functions', { useValue: firebase.functions })
}