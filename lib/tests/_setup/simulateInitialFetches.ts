import { DependencyContainer } from 'tsyringe'
import { when } from 'mobx'
import InitialFetchHandler from '@/logic/app/InitialFetchHandler'

export default async function simulateInitialFetches(testContainer: DependencyContainer) {
  await (when(() => testContainer.resolve(InitialFetchHandler).hasCompletedInitialFetches))
}