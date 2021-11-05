
import { container } from 'tsyringe'
import { doc, deleteDoc } from 'firebase/firestore'
import AuthUser from '@/lib/logic/app/AuthUser'
import DbHandler from '@/lib/logic/app/DbHandler'

async function deleteHabitsDoc() {
  const authUser = container.resolve(AuthUser)
  const db = container.resolve(DbHandler).db
  await deleteDoc(doc(db, 'users', authUser.uid, 'data', 'habits'))
}

export default deleteHabitsDoc