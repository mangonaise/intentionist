import { waitForCloudFunctionExecution } from './_helpers'
import getFirebaseAdmin from '@/test-setup/getFirebaseAdmin'
import getDbShortcuts from '@/test-setup/getDbShortcuts'

// 🔨

const { app, db } = getFirebaseAdmin()
const {
  userDoc,
  usernameDoc,
  friendsDoc,
  friendRequestsDoc
} = getDbShortcuts(db)

const now = Date.now()
let testUser = {
  uid: 'test-onUpdateUserDocument',
  username: `test_username${now}`,
  displayName: 'onUpdateUserDocument Test User',
  avatar: '🧪'
}

afterAll(async () => {
  await app.delete()
})

// 🧪

describe('automatically creating and updating username documents', () => {
  afterAll(async () => {
    await userDoc(testUser.uid).delete()
    await usernameDoc(testUser.username).delete()
  })

  test(`1. creating a user document automatically creates a username document with the user's avatar and display name`, async () => {
    await userDoc(testUser.uid).set({
      username: testUser.username,
      displayName: testUser.displayName,
      avatar: testUser.avatar
    })

    await waitForCloudFunctionExecution()

    const generatedUsernameDoc = await usernameDoc(testUser.username).get()
    expect(generatedUsernameDoc.data()).toEqual({
      displayName: testUser.displayName,
      avatar: testUser.avatar
    })
  })

  test('2. when a user changes their username, the old username document is deleted and a new one is created', async () => {
    const originalUsername = testUser.username
    testUser.username = `test_username_updated${now}`
    await userDoc(testUser.uid).update({
      username: testUser.username
    })

    await waitForCloudFunctionExecution()

    const originalUsernameDoc = await usernameDoc(originalUsername).get()
    expect(originalUsernameDoc.exists).toEqual(false)

    const updatedUsernameDoc = await usernameDoc(testUser.username).get()
    expect(updatedUsernameDoc.data()).toEqual({
      displayName: testUser.displayName,
      avatar: testUser.avatar
    })
  })

  test('3. when a user updates their avatar or display name, the username document is updated with the new data', async () => {
    testUser.avatar = '😎'
    testUser.displayName = 'onUpdateUserDocument Cool User'

    await userDoc(testUser.uid).update({ avatar: testUser.avatar, displayName: testUser.displayName })
    await waitForCloudFunctionExecution()

    const updatedUsernameDoc = await usernameDoc(testUser.username).get()
    expect(updatedUsernameDoc.data()).toEqual({
      displayName: testUser.displayName,
      avatar: testUser.avatar
    })
  })
})

describe('automatically updating denormalized data when a user updates their profile', () => {
  beforeAll(async () => {
    await userDoc(testUser.uid).set({
      username: testUser.username,
      displayName: testUser.displayName,
      avatar: testUser.avatar
    })
    await waitForCloudFunctionExecution()
  })

  afterAll(async () => {
    await userDoc(testUser.uid).delete()
    await usernameDoc(testUser.username).delete()
  })

  describe('updating denormalized data in friendRequests doc', () => {
    const otherUsername = 'other_username' // for ensuring proper merge
    const senderUid = `test-request-sender-uid${now}`
    const recipientUid = `test-request-recipient-uid${now}`

    beforeEach(async () => {
      await friendRequestsDoc(senderUid).set({
        outgoing: {
          [testUser.username]: { time: 123, displayName: testUser.displayName, avatar: testUser.avatar },
          [otherUsername]: { time: 123 }
        }
      })

      await friendRequestsDoc(recipientUid).set({
        incoming: {
          [testUser.username]: { time: 456, displayName: testUser.displayName, avatar: testUser.avatar },
          [otherUsername]: { time: 123 }
        }
      })
    })

    afterEach(async () => {
      await db.recursiveDelete(userDoc(senderUid))
      await db.recursiveDelete(userDoc(recipientUid))
    })

    test('when a user updates their profile info, the friendRequests docs of anyone who has a request to or from that user will be updated', async () => {
      testUser.avatar = '🐸'
      testUser.displayName = 'onUpdateUserDocument Test Frog'
      await userDoc(testUser.uid).update({ avatar: testUser.avatar, displayName: testUser.displayName })
      await waitForCloudFunctionExecution()

      expect((await friendRequestsDoc(senderUid).get()).data()).toEqual({
        outgoing: {
          [testUser.username]: {
            time: 123,
            displayName: testUser.displayName,
            avatar: testUser.avatar
          },
          [otherUsername]: {
            time: 123
          }
        }
      })

      expect((await friendRequestsDoc(recipientUid).get()).data()).toEqual({
        incoming: {
          [testUser.username]: {
            time: 456,
            displayName: testUser.displayName,
            avatar: testUser.avatar
          },
          [otherUsername]: {
            time: 123
          }
        }
      })
    })

    test('when a user updates their username, the friendRequests docs of anyone who has a request to or from that user will be updated', async () => {
      testUser.username = `a_very_cool_username${now}`
      await userDoc(testUser.uid).update({ username: testUser.username })
      await waitForCloudFunctionExecution()

      expect((await friendRequestsDoc(senderUid).get()).data()).toEqual({
        outgoing: {
          [testUser.username]: {
            time: 123,
            displayName: testUser.displayName,
            avatar: testUser.avatar
          },
          [otherUsername]: {
            time: 123
          }
        }
      })

      expect((await friendRequestsDoc(recipientUid).get()).data()).toEqual({
        incoming: {
          [testUser.username]: {
            time: 456,
            displayName: testUser.displayName,
            avatar: testUser.avatar
          },
          [otherUsername]: {
            time: 123
          }
        }
      })
    })
  })

  describe('automatically updating denormalized user data in friends doc', () => {
    const friendUid = `test-friend-uid${now}`
    const otherUid = `other-uid${now}` // for ensuring proper merge

    beforeEach(async () => {
      await friendsDoc(friendUid).set({
        friends: {
          [testUser.uid]: { time: 123, username: testUser.username, displayName: testUser.displayName, avatar: testUser.avatar },
          [otherUid]: { time: 123 }
        }
      })
    })

    afterEach(async () => {
      await db.recursiveDelete(userDoc(friendUid))
    })

    test('when a user updates their profile info, the friends doc of anyone who is friends with that user will be updated', async () => {
      testUser.username = `my_brand_new_username${now}`
      testUser.avatar = '✨'
      await userDoc(testUser.uid).update({ username: testUser.username, avatar: testUser.avatar })
      await waitForCloudFunctionExecution()

      expect((await friendsDoc(friendUid).get()).data()).toEqual({
        friends: {
          [testUser.uid]: { time: 123, username: testUser.username, displayName: testUser.displayName, avatar: testUser.avatar },
          [otherUid]: { time: 123 }
        }
      })
    })
  })
})