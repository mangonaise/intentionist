import { FirebaseServices } from '@/firebase-setup/initializeFirebase'
import { deleteApp } from '@firebase/app'
import { deleteUser } from '@firebase/auth'
import { terminate, clearIndexedDbPersistence } from '@firebase/firestore'

export default async function teardownFirebase(firebase: FirebaseServices) {
  if (firebase.auth.currentUser) {
    await deleteUser(firebase.auth.currentUser)
  }
  
  await terminate(firebase.db)
  await clearIndexedDbPersistence(firebase.db)
  await deleteApp(firebase.app)  
}