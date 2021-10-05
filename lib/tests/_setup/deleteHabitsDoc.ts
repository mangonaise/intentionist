import { container } from 'tsyringe'
import { doc, deleteDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import AuthUser from '../../logic/app/AuthUser'

async function deleteHabitsDoc() {
  const authUser = container.resolve(AuthUser)
  await deleteDoc(doc(db, 'users', authUser.uid, 'data', 'habits'))
}

export default deleteHabitsDoc