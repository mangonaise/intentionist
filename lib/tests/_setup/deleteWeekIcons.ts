import { container } from 'tsyringe'
import { collection, deleteDoc, getDocs, query } from '@firebase/firestore'
import AuthUser from '@/logic/app/AuthUser'
import DbHandler from '@/logic/app/DbHandler'

export default async function deleteWeekIcons() {
  const authUser = container.resolve(AuthUser)
  const db = container.resolve(DbHandler).db
  const iconDocs = await getDocs(query(collection(db, 'users', authUser.uid, 'weekIcons')))
  iconDocs.forEach(async (doc) => await deleteDoc(doc.ref))
}