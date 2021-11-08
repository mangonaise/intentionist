import '@abraham/reflection'
import { container } from 'tsyringe'
import { when } from 'mobx'
import initializeFirebase, { registerFirebaseInjectionTokens } from '@/firebase-setup/initializeFirebase'
import ProfileHandler, { UserProfileInfo } from '@/logic/app/ProfileHandler'
import FriendRequestsHandler from '@/logic/app/FriendRequestsHandler'
import simulateInitialFetches from '@/test-setup/simulateInitialFetches'
import signInDummyUser from '@/test-setup/signInDummyUser'
import getFirebaseAdmin from '@/test-setup/getFirebaseAdmin'
import teardownFirebase from '@/test-setup/teardownFirebase'

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
  await teardownFirebase(firebase)
})

async function waitForRealtimeUpdates() {
  return new Promise((resolve) => setTimeout(resolve, 200))
}

// 🧪

describe('initialization', () => {
  test('incoming and outgoing requests initialize to empty arrays', () => {
    expect(requestsHandler.incomingRequests).toEqual([])
    expect(requestsHandler.outgoingRequests).toEqual([])
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

  test(`when a request is sent, the user's data appears in the outgoing requests array`, async () => {
    await requestsHandler.sendFriendRequest(recipient.username)
    await waitForRealtimeUpdates()
    expect(requestsHandler.outgoingRequests).toEqual([{
      username: recipient.username,
      displayName: recipient.displayName,
      avatar: recipient.avatar
    }])
  })

  test('immediately after sending a request, the outgoing friend request status is set to "sending"', async () => {
    requestsHandler.sendFriendRequest(recipient.username)
    expect(requestsHandler.pendingStatus).toEqual('sending')
    await when(() => requestsHandler.pendingStatus !== 'sending')
  })

  test('after a request is successfully sent, the outgoing request status is set to "sent"', async () => {
    await requestsHandler.sendFriendRequest(recipient.username)
    expect(requestsHandler.pendingStatus).toEqual('sent')
  })

  test('if the friend request fails, the outgoing request status is set to "error"', async () => {
    await requestsHandler.sendFriendRequest('this_user_does_not_exist')
    expect(requestsHandler.pendingStatus).toEqual('error')
  })
})

describe('processing incoming and outgoing requests', () => {
  afterEach(async () => {
    await friendRequests().delete()
  })

  test('incoming and outgoing requests appear in their respective usernames arrays, sorted by newest first', async () => {
    await friendRequests().set({
      incoming: {
        username_a: { time: 1000, displayName: 'Mr A', avatar: '😎' },
        username_b: { time: 2000, displayName: 'Mrs B', avatar: '🧐' }
      },
      outgoing: {
        username_c: { time: 1000, displayName: 'Herr C', avatar: '🐸' },
        username_d: { time: 2000, displayName: 'Frau D', avatar: '🐵' }
      }
    })

    await waitForRealtimeUpdates()
    expect(requestsHandler.incomingRequests).toEqual([
      { username: 'username_b', displayName: 'Mrs B', avatar: '🧐' },
      { username: 'username_a', displayName: 'Mr A', avatar: '😎' }
    ])
    expect(requestsHandler.outgoingRequests).toEqual([
      { username: 'username_d', displayName: 'Frau D', avatar: '🐵' },
      { username: 'username_c', displayName: 'Herr C', avatar: '🐸' }
    ])
  })
})