import getFirebaseAdmin from '@/test-setup/getFirebaseAdmin'
import { waitForCloudFunctionExecution } from './_helpers'

// 🔨

const { app, db } = getFirebaseAdmin()

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
    await db.collection('users').doc(uid).delete()
    await db.collection('usernames').doc(updatedUsername).delete()
  })

  test(`1. creating a user document automatically creates a username document with the user's avatar and display name`, async () => {
    await db.collection('users').doc(uid).set({
      username: originalUsername,
      ...testAvatarAndDisplayName
    })

    await waitForCloudFunctionExecution()

    const usernameDoc = await db.collection('usernames').doc(originalUsername).get()
    expect(usernameDoc.data()).toEqual(testAvatarAndDisplayName)
  })

  test('2. when a user changes their username, the old username document is deleted and a new one is created', async () => {
    await db.collection('users').doc(uid).update({
      username: updatedUsername
    })

    await waitForCloudFunctionExecution()

    const originalUsernameDoc = await db.collection('usernames').doc(originalUsername).get()
    expect(originalUsernameDoc.exists).toEqual(false)

    const updatedUsernameDoc = await db.collection('usernames').doc(updatedUsername).get()
    expect(updatedUsernameDoc.data()).toEqual(testAvatarAndDisplayName)
  })

  test('3. when a user updates their avatar or display name, the username document is updated with the new data', async () => {
    const newAvatarAndDisplayName = {
      avatar: '😎',
      displayName: 'Cool Firebase Admin'
    }

    await db.collection('users').doc(uid).update(newAvatarAndDisplayName)

    await waitForCloudFunctionExecution()

    const usernameDoc = await db.collection('usernames').doc(updatedUsername).get()
    expect(usernameDoc.data()).toEqual(newAvatarAndDisplayName)
  })
})
