
import { container } from 'tsyringe'
import { Firestore } from 'firebase-admin/firestore'
import AuthUser from '@/logic/app/AuthUser'

async function deleteHabitsDoc(adminDb: Firestore) {
  const authUser = container.resolve(AuthUser)
  await adminDb.collection('users').doc(authUser.uid).collection('data').doc('habits').delete()
}

export default deleteHabitsDoc