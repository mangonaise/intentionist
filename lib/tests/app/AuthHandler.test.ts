import '@abraham/reflection'
import { container } from 'tsyringe'
import { deleteApp } from 'firebase/app'
import initializeFirebase from '@/lib/firebase'
import AuthHandler from '@/lib/logic/app/AuthHandler'
import signInDummyUser from '@/test-setup/signInDummyUser'

const { firebaseApp } = initializeFirebase('test-authhandler')

afterAll(() => {
  deleteApp(firebaseApp)
})

test('signing in and out correctly updates local auth state', async () => {
  const authHandler = container.resolve(AuthHandler)
  expect(authHandler.isAuthenticated).toBe(false)
  await signInDummyUser()
  expect(authHandler.isAuthenticated).toBe(true)
  await authHandler.handleSignOut()
  expect(authHandler.isAuthenticated).toBe(false)
})