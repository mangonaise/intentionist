import { container } from 'tsyringe'
import { Firestore } from 'firebase-admin/firestore'
import AuthUser from '@/logic/app/AuthUser'

export default async function deleteWeeks(adminDb: Firestore) {
  const authUser = container.resolve(AuthUser)
  const weekDocs = await adminDb.collection('users').doc(authUser.uid).collection('weeks').get()
  weekDocs.forEach(async (doc) => await doc.ref.delete())
}