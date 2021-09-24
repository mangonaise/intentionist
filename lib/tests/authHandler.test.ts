import authHandler from '../logic/app/authHandler'
import signInDummyUser from './_setup/signIn'

test('local user reflects firebase auth state', async () => {
  expect(authHandler.user).toBeNull()
  await signInDummyUser()
  expect(authHandler.user).not.toBeNull()
  await authHandler.handleSignOut()
  expect(authHandler.user).toBeNull()
})