import { container } from 'tsyringe'
import { doc, deleteDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import AuthUser from '../../logic/app/AuthUser'
import HabitsHandler from '../../logic/app/HabitsHandler'

async function resetHabits() {
  const habitsHandler = container.resolve(HabitsHandler)
  const authUser = container.resolve(AuthUser)
  for (const habit of habitsHandler.habits) {
    await habitsHandler.deleteHabitById(habit.id)
  }
  await deleteDoc(doc(db, 'users', authUser.uid, 'data', 'habits'))
  habitsHandler.habits = []
  habitsHandler.hasFetchedHabits = false
}

export default resetHabits