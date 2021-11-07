import '@abraham/reflection'
import { container } from 'tsyringe'
import initializeFirebase from '@/firebase-setup/initializeFirebase'
import AuthHandler from '@/logic/app/AuthHandler'
import signInDummyUser from '@/test-setup/signInDummyUser'
import teardownFirebase from '@/test-setup/teardownFirebase'

const firebase = initializeFirebase('test-authhandler')
const userSeed = 'authhandler'

afterAll(async () => {
  // user needs to be signed in to be deleted by teardown
  await signInDummyUser(userSeed)
  await teardownFirebase(firebase)
})

test('signing in and out correctly updates local auth state', async () => {
  const authHandler = container.resolve(AuthHandler)
  expect(authHandler.isAuthenticated).toBe(false)
  await signInDummyUser(userSeed)
  expect(authHandler.isAuthenticated).toBe(true)
  await authHandler.handleSignOut()
  expect(authHandler.isAuthenticated).toBe(false)
})