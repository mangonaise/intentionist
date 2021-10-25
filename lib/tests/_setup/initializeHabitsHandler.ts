import { DependencyContainer } from 'tsyringe'
import HabitsHandler from '@/lib/logic/app/HabitsHandler'
import initializeTestApp from './initializeTestApp'

export default async function initializeHabitsHandler(testContainer: DependencyContainer) {
  await initializeTestApp(testContainer)
  return testContainer.resolve(HabitsHandler)
}