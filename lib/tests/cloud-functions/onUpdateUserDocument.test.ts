import getFirebaseAdmin from '@/test-setup/getFirebaseAdmin'
import { waitForCloudFunctionExecution, getDbShortcuts } from './_helpers'

// 🔨

const { app, db } = getFirebaseAdmin()
const {
  userDoc,
  usernameDoc
} = getDbShortcuts(db)

afterAll(async () => {
  await app.delete()
})

// 🧪

describe('onUpdateUserDocument background trigger function', () => {
  const now = Date.now()
  const uid = 'test-onUpdateUserDocument'
  const originalUsername = `test_username${now}`
  const updatedUsername = `test_username_updated${now}`
  const testAvatarAndDisplayName = {
    avatar: '🧪',
    displayName: 'Firebase Admin'
  }

  afterAll(async () => {
    await userDoc(uid).delete()
    await usernameDoc(updatedUsername).delete()
  })

  test(`1. creating a user document automatically creates a username document with the user's avatar and display name`, async () => {
    await userDoc(uid).set({
      username: originalUsername,
      ...testAvatarAndDisplayName
    })

    await waitForCloudFunctionExecution()

    const generatedUsernameDoc = await usernameDoc(originalUsername).get()
    expect(generatedUsernameDoc.data()).toEqual(testAvatarAndDisplayName)
  })

  test('2. when a user changes their username, the old username document is deleted and a new one is created', async () => {
    await userDoc(uid).update({
      username: updatedUsername
    })

    await waitForCloudFunctionExecution()

    const originalUsernameDoc = await usernameDoc(originalUsername).get()
    expect(originalUsernameDoc.exists).toEqual(false)

    const updatedUsernameDoc = await usernameDoc(updatedUsername).get()
    expect(updatedUsernameDoc.data()).toEqual(testAvatarAndDisplayName)
  })

  test('3. when a user updates their avatar or display name, the username document is updated with the new data', async () => {
    const newAvatarAndDisplayName = {
      avatar: '😎',
      displayName: 'Cool Firebase Admin'
    }

    await userDoc(uid).update(newAvatarAndDisplayName)

    await waitForCloudFunctionExecution()

    const updatedUsernameDoc = await usernameDoc(updatedUsername).get()
    expect(updatedUsernameDoc.data()).toEqual(newAvatarAndDisplayName)
  })
})
