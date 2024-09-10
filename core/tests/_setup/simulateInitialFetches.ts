import { container } from 'tsyringe'
import { when } from 'mobx'
import InitialFetchHandler from '@/logic/app/InitialFetchHandler'

export default async function simulateInitialFetches() {
  await (when(() => container.resolve(InitialFetchHandler).hasCompletedInitialFetches))
}