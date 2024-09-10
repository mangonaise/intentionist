import { container } from 'tsyringe'
import { Firestore } from 'firebase-admin/firestore'
import AuthUser from '@/logic/app/AuthUser'
import getDbShortcuts from '@/test-setup/getDbShortcuts'


export default async function deleteHabits(adminDb: Firestore) {
  const { userDoc, userDataCollection } = getDbShortcuts(adminDb)
  const authUser = container.resolve(AuthUser)
  await adminDb.recursiveDelete(userDoc(authUser.uid).collection('habits'))
  await userDataCollection(authUser.uid).doc('habitDetails').delete()
}