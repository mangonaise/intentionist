import '@abraham/reflection'
import { container } from 'tsyringe'
import { when } from 'mobx'
import { deleteApp } from '@firebase/app'
import initializeFirebase, { registerFirebaseInjectionTokens } from '@/firebase-setup/initializeFirebase'
import ProfileHandler, { UserProfileInfo } from '@/logic/app/ProfileHandler'
import FriendRequestsHandler from '@/logic/app/FriendRequestsHandler'
import simulateInitialFetches from '@/test-setup/simulateInitialFetches'
import signInDummyUser from '@/test-setup/signInDummyUser'
import getFirebaseAdmin from '@/test-setup/getFirebaseAdmin'

// 🔨

const firebase = initializeFirebase()
const { db } = getFirebaseAdmin()

const usernames = db.collection('usernames')
const users = db.collection('users')
const friendRequests = () => users.doc(testUserUid).collection('data').doc('friendRequests')

let testUserUid: string
let testUserProfile: UserProfileInfo = {
  username: `frh${Date.now()}`,
  displayName: 'FriendRequestsHandler Test User',
  avatar: '🧪'
}
let requestsHandler: FriendRequestsHandler

beforeAll(async () => {
  const user = await signInDummyUser('testfrh')
  testUserUid = user.uid
  await users.doc(testUserUid).set(testUserProfile)
})

beforeEach(async () => {
  registerFirebaseInjectionTokens(firebase)
  await simulateInitialFetches()
  requestsHandler = container.resolve(FriendRequestsHandler)
  requestsHandler.startListener()
})

afterEach(async () => {
  requestsHandler.stopListener()
  container.clearInstances()
})

afterAll(async () => {
  await db.recursiveDelete(users.doc(testUserUid))
  await usernames.doc(testUserProfile.username).delete()
  await deleteApp(firebase.app)
})

async function waitForRealtimeUpdates() {
  return new Promise((resolve) => setTimeout(resolve, 200))
}

// 🧪

describe('initialization', () => {
  test('incoming and outgoing usernames initialize to empty arrays', () => {
    expect(requestsHandler.requestsData.incomingUsernames).toEqual([])
    expect(requestsHandler.requestsData.outgoingUsernames).toEqual([])
  })

  test('incoming and outgoing view limits both initialize to 10', () => {
    expect(requestsHandler.requestsData.incomingViewLimit).toEqual(10)
    expect(requestsHandler.requestsData.outgoingViewLimit).toEqual(10)
  })

  test('view mode initializes to "incoming"', () => {
    expect(requestsHandler.viewMode).toEqual('incoming')
  })
})

test('the view mode can be switched between incoming and outgoing', () => {
  requestsHandler.setViewMode('outgoing')
  expect(requestsHandler.viewMode).toEqual('outgoing')
  requestsHandler.setViewMode('incoming')
  expect(requestsHandler.viewMode).toEqual('incoming')
})

describe('searching for users', () => {
  describe('valid search', () => {
    const jeff = { username: 'my_name_is_jeff', avatar: '🧪', displayName: 'Jeff' }

    beforeEach(async () => {
      await usernames.doc(jeff.username).set({
        displayName: jeff.displayName, avatar: jeff.avatar
      })
    })

    afterEach(async () => {
      await usernames.doc(jeff.username).delete()
    })

    test('searching for an existing user returns an object with their avatar and display name', async () => {
      const searchResult = await requestsHandler.searchForUser(jeff.username)
      expect(searchResult).toEqual({
        avatar: jeff.avatar,
        displayName: jeff.displayName
      })
    })

    test(`searching for an existing user adds that user's data to the cache`, async () => {
      await requestsHandler.searchForUser(jeff.username)
      expect(requestsHandler.cachedUserData[jeff.username]).toEqual({
        displayName: jeff.displayName, avatar: jeff.avatar
      })
    })
  })

  describe('handling invalid searches', () => {
    test('searching for a user that does not exist returns "not found"', async () => {
      const searchResult = await requestsHandler.searchForUser('i_do_not_exist')
      expect(searchResult).toEqual('not found')
    })

    test('searching for yourself returns "self"', async () => {
      await container.resolve(ProfileHandler).setUserProfileInfo(testUserProfile)

      const searchResult = await requestsHandler.searchForUser(testUserProfile.username)
      expect(searchResult).toEqual('self')
    })

    test('searching for an invalid username returns "invalid"', async () => {
      expect(await requestsHandler.searchForUser('a')).toEqual('invalid')
      expect(await requestsHandler.searchForUser('a'.repeat(31))).toEqual('invalid')
      expect(await requestsHandler.searchForUser('invalid-char')).toEqual('invalid')
      expect(await requestsHandler.searchForUser('abc_')).toEqual('invalid')
    })
  })
})

describe('sending friend requests', () => {
  const recipient = {
    uid: 'test-recipient-uid',
    username: 'test_recipient',
    displayName: 'Test Recipient',
    avatar: '🧪'
  }

  beforeEach(async () => {
    await users.doc(recipient.uid).set({
      username: recipient.username,
      displayName: recipient.displayName,
      avatar: recipient.avatar
    })
    await usernames.doc(recipient.username).set({
      displayName: recipient.displayName,
      avatar: recipient.avatar
    })
  })

  afterEach(async () => {
    await usernames.doc(recipient.username).delete()
    await db.recursiveDelete(users.doc(recipient.uid))
    await friendRequests().delete()
  })

  test('when a request is sent, the username appears in the outgoing usernames array', async () => {
    await requestsHandler.sendFriendRequest(recipient.username)
    await waitForRealtimeUpdates()
    expect(requestsHandler.requestsData.outgoingUsernames).toEqual([recipient.username])
  })

  test('immediately after sending a request, the outgoing friend request status is set to "sending"', async () => {
    requestsHandler.sendFriendRequest(recipient.username)
    expect(requestsHandler.outgoingRequestStatus).toEqual('sending')
    await when(() => requestsHandler.outgoingRequestStatus !== 'sending')
  })

  test('after a request is successfully sent, the outgoing request status is set to "sent"', async () => {
    await requestsHandler.sendFriendRequest(recipient.username)
    expect(requestsHandler.outgoingRequestStatus).toEqual('sent')
  })

  test('if the friend request fails, the outgoing request status is set to "error"', async () => {
    await requestsHandler.sendFriendRequest('this_user_does_not_exist')
    expect(requestsHandler.outgoingRequestStatus).toEqual('error')
  })
})

describe('processing incoming and outgoing requests', () => {
  afterEach(async () => {
    await friendRequests().delete()
  })

  test('incoming and outgoing requests appear in their respective usernames arrays, sorted by newest first', async () => {
    await friendRequests().set({
      incoming: {
        username_a: { time: 1000 },
        username_b: { time: 2000 }
      },
      outgoing: {
        username_c: { time: 1000 },
        username_d: { time: 2000 }
      }
    })

    await waitForRealtimeUpdates()
    expect(requestsHandler.requestsData.incomingUsernames).toEqual([
      'username_b',
      'username_a'
    ])
    expect(requestsHandler.requestsData.outgoingUsernames).toEqual([
      'username_d',
      'username_c'
    ])
  })

  test('user data for incoming requests is auto-cached when view mode is "incoming" and fetching is enabled', async () => {
    expect(requestsHandler.cachedUserData).toEqual({})
    await usernames.doc('username_a').set({ avatar: '😎', displayName: 'Mr A' })
    await usernames.doc('username_b').set({ avatar: '🧐', displayName: 'Mrs B' })
    await friendRequests().set({
      incoming: {
        username_a: { time: 1000 }
      }
    })

    // no caching when fetching is not yet enabled
    await waitForRealtimeUpdates()
    expect(requestsHandler.cachedUserData).toEqual({})

    // don't fetch incoming requests when viewMode is "outgoing"
    requestsHandler.setViewMode('outgoing')
    requestsHandler.setUserDataFetchingEnabled(true)
    expect(requestsHandler.cachedUserData).toEqual({})

    requestsHandler.setViewMode('incoming')
    await waitForRealtimeUpdates()
    expect(requestsHandler.cachedUserData.username_a).toEqual({ avatar: '😎', displayName: 'Mr A' })

    // respond to realtime friend requests
    await friendRequests().set({
      incoming: {
        username_b: { time: 2000 }
      }
    }, { merge: true })

    await waitForRealtimeUpdates()
    expect(requestsHandler.cachedUserData.username_b).toEqual({ avatar: '🧐', displayName: 'Mrs B' })

    await usernames.doc('username_a').delete()
    await usernames.doc('username_b').delete()
  })

  test('user data for outgoing requests is auto-cached when view mode is "outgoing" and fetching is enabled', async () => {
    requestsHandler.setUserDataFetchingEnabled(true)
    await usernames.doc('username_a').set({ avatar: '😎', displayName: 'Mr A' })
    await friendRequests().set({
      outgoing: {
        username_a: { time: 1000 }
      }
    })

    // don't fetch outgoing requests when view mode is "incoming"
    await waitForRealtimeUpdates()
    expect(requestsHandler.cachedUserData).toEqual({})

    requestsHandler.setViewMode('outgoing')
    await waitForRealtimeUpdates()
    expect(requestsHandler.cachedUserData.username_a).toEqual({ avatar: '😎', displayName: 'Mr A' })

    await usernames.doc('username_a').delete()
  })
})