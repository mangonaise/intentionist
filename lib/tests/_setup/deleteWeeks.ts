import { container } from 'tsyringe'
import { collection, deleteDoc, getDocs, query } from '@firebase/firestore'
import { db } from '@/lib/firebase'
import AuthUser from '@/lib/logic/app/AuthUser'

export default async function deleteWeeks() {
  const authUser = container.resolve(AuthUser)
  const weekDocs = await getDocs(query(collection(db, 'users', authUser.uid, 'weeks')))
  weekDocs.forEach(async (doc) => await deleteDoc(doc.ref))
}