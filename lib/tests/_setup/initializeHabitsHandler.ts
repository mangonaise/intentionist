import { container as globalContainer, DependencyContainer } from 'tsyringe'
import { when } from 'mobx'
import InitialFetchHandler from '@/lib/logic/app/InitialFetchHandler'
import HabitsHandler from '@/lib/logic/app/HabitsHandler'

export default async function initializeHabitsHandler(container?: DependencyContainer) {
  const testContainer = container || globalContainer.createChildContainer()
  await (when(() => testContainer.resolve(InitialFetchHandler).hasCompletedInitialFetches))
  return testContainer.resolve(HabitsHandler)
}