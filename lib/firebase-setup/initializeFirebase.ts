import type { Auth } from '@firebase/auth'
import type { Firestore } from '@firebase/firestore'
import type { Functions } from '@firebase/functions'
import { container } from 'tsyringe'
import { FirebaseApp, initializeApp } from '@firebase/app'
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
  const firebaseConfig = {
    projectId,
    apiKey: 'AIzaSyCfjsR8D8fm-na_IVemInUmEiGerYcSblk',
    authDomain: 'intentionist.firebaseapp.com',
    storageBucket: 'intentionist.appspot.com'
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
      provider: new ReCaptchaV3Provider(process.env.RECAPTCHA_V3_SITE_KEY ?? 'emulator_fake_site_key'),
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