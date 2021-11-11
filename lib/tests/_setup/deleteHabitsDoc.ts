
import { container } from 'tsyringe'
import { Firestore } from 'firebase-admin/firestore'
import getDbShortcuts from '@/test-setup/getDbShortcuts'
import AuthUser from '@/logic/app/AuthUser'

async function deleteHabitsDoc(adminDb: Firestore) {
  const { userDataCollection } = getDbShortcuts(adminDb)
  const authUser = container.resolve(AuthUser)
  await userDataCollection(authUser.uid).doc('habits').delete()
}

export default deleteHabitsDoc