import '@abraham/reflection'
import { container } from 'tsyringe'
import { when } from 'mobx'
import initializeFirebase, { registerFirebaseInjectionTokens } from '@/firebase-setup/initializeFirebase'
import ProfileHandler, { UserProfileInfo } from '@/logic/app/ProfileHandler'
import FriendsHandler, { maxFriends } from '@/logic/app/FriendsHandler'
import FriendRequestsHandler, { PendingFriendRequestStatus, UserSearchResult } from '@/logic/app/FriendRequestsHandler'
import simulateInitialFetches from '@/test-setup/simulateInitialFetches'
import signInDummyUser from '@/test-setup/signInDummyUser'
import getDbShortcuts from '@/test-setup/getDbShortcuts'
import waitForRealtimeUpdates from '@/test-setup/waitForRealtimeUpdates'
import getFirebaseAdmin from '@/test-setup/getFirebaseAdmin'
import teardownFirebase from '@/test-setup/teardownFirebase'

//#region test setup

const firebase = initializeFirebase()
const { db } = getFirebaseAdmin()
const { usernameDoc, userDoc, friendRequestsDoc } = getDbShortcuts(db)

const now = Date.now()
let requestsHandler: FriendRequestsHandler, friendsHandler: FriendsHandler
let testUserUid: string
let testUserProfile: UserProfileInfo = {
  username: `frh${now}`,
  displayName: 'FriendRequestsHandler Test User',
  avatar: '🧪'
}

beforeAll(async () => {
  const user = await signInDummyUser('testfrh')
  testUserUid = user.uid
  await userDoc(testUserUid).set(testUserProfile)
})

beforeEach(async () => {
  registerFirebaseInjectionTokens(firebase)
  await simulateInitialFetches()
  requestsHandler = container.resolve(FriendRequestsHandler)
  requestsHandler.startListener()
  friendsHandler = container.resolve(FriendsHandler)
  friendsHandler.listenToFriendsDoc()
})

afterEach(async () => {
  requestsHandler.stopListener()
  friendsHandler.stopFriendsDocListener()
  container.clearInstances()
})

afterAll(async () => {
  await db.recursiveDelete(userDoc(testUserUid))
  await usernameDoc(testUserProfile.username).delete()
  await teardownFirebase(firebase)
})

//#endregion

describe('searching for users', () => {
  describe('valid search', () => {
    const jeff = { username: 'my_name_is_jeff', avatar: '🧪', displayName: 'Jeff' }

    beforeEach(async () => {
      await usernameDoc(jeff.username).set({
        displayName: jeff.displayName, avatar: jeff.avatar
      })
    })

    afterEach(async () => {
      await usernameDoc(jeff.username).delete()
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
      expect(searchResult).toEqual<UserSearchResult>('not found')
    })

    test('searching for yourself returns "self"', async () => {
      await container.resolve(ProfileHandler).setUserProfileInfo(testUserProfile)

      const searchResult = await requestsHandler.searchForUser(testUserProfile.username)
      expect(searchResult).toEqual<UserSearchResult>('self')
    })

    test('searching for an invalid username returns "invalid"', async () => {
      expect(await requestsHandler.searchForUser('a')).toEqual('invalid')
      expect(await requestsHandler.searchForUser('toolong'.repeat(30))).toEqual('invalid')
      expect(await requestsHandler.searchForUser('invalid$char')).toEqual('invalid')
      expect(await requestsHandler.searchForUser('end_underscore_')).toEqual('invalid')
    })

    test('searching for a user who you have an outgoing friend request to returns "already outgoing"', async () => {
      requestsHandler.outgoingRequests.push({ username: 'test_already_outgoing', avatar: '🧪', displayName: 'Test Already Outgoing' })
      const searchResult = await requestsHandler.searchForUser('test_already_outgoing')
      expect(searchResult).toEqual<UserSearchResult>('already outgoing')
    })

    test('searching for a user who you have an incoming friend request from returns "already incoming"', async () => {
      requestsHandler.incomingRequests.push({ username: 'test_already_incoming', avatar: '🧪', displayName: 'Test Already Incoming' })
      const searchResult = await requestsHandler.searchForUser('test_already_incoming')
      expect(searchResult).toEqual<UserSearchResult>('already incoming')
    })

    test('searching for a user who is already your friend returns "already friends"', async () => {
      friendsHandler.friends.push({ uid: 'test-already-friends', username: 'test_already_friends', avatar: '🧪', displayName: 'Test Already Friends' })
      const searchResult = await requestsHandler.searchForUser('test_already_friends')
      expect(searchResult).toEqual<UserSearchResult>('already friends')
    })

    test('searching for a user when you have reached the maximum friends limit returns "max friends"', async () => {
      friendsHandler.friends = Array.from({ length: maxFriends }).map((_, index) => ({
        uid: `uid-${index}`,
        avatar: '🧪',
        displayName: 'Test Max Friends',
        username: `test_max_friends${index}`
      }))
      const searchResult = await requestsHandler.searchForUser('does_not_matter')
      expect(searchResult).toEqual<UserSearchResult>('max friends')
    })
  })
})

describe('sending and canceling outgoing friend requests', () => {
  const recipient = {
    uid: `test-recipient-uid${now}`,
    username: `test_recipient${now}`,
    displayName: 'Test Recipient',
    avatar: '🧪'
  }

  beforeEach(async () => {
    await userDoc(recipient.uid).set({
      username: recipient.username,
      displayName: recipient.displayName,
      avatar: recipient.avatar
    })
    await usernameDoc(recipient.username).set({
      displayName: recipient.displayName,
      avatar: recipient.avatar
    })
  })

  afterEach(async () => {
    await usernameDoc(recipient.username).delete()
    await db.recursiveDelete(userDoc(recipient.uid))
    await friendRequestsDoc(testUserUid).delete()
  })

  test(`when a request is successfully sent to a user, the recipient's profile data appears in the sender's outgoing requests array`, async () => {
    await requestsHandler.sendFriendRequest(recipient.username)
    await waitForRealtimeUpdates()

    expect(requestsHandler.outgoingRequests).toEqual([{
      username: recipient.username,
      displayName: recipient.displayName,
      avatar: recipient.avatar
    }])
  })

  test('when a friend request is canceled, it is removed from the outgoing requests array', async () => {
    await requestsHandler.sendFriendRequest(recipient.username)
    await waitForRealtimeUpdates()
    const request = requestsHandler.outgoingRequests.find((request) => request.username === recipient.username)
    await requestsHandler.cancelOutgoingFriendRequest(request!)
    await waitForRealtimeUpdates()
    expect(requestsHandler.outgoingRequests).toEqual([])
  })

  test('after sending a friend request, in the time before the request resolves, the pending friend request status is set to "sending"', async () => {
    requestsHandler.sendFriendRequest(recipient.username)
    expect(requestsHandler.pendingStatus).toEqual<PendingFriendRequestStatus>('sending')
    await when(() => requestsHandler.pendingStatus !== 'sending')
  })

  test('after a friend request is successfully sent, the pending friend request status is set to "sent"', async () => {
    await requestsHandler.sendFriendRequest(recipient.username)
    expect(requestsHandler.pendingStatus).toEqual<PendingFriendRequestStatus>('sent')
  })

  test('if a friend request fails, the pending friend request status is set to "error"', async () => {
    await requestsHandler.sendFriendRequest('this_user_does_not_exist')
    expect(requestsHandler.pendingStatus).toEqual<PendingFriendRequestStatus>('error')
  })
})

describe('responding to incoming friend requests', () => {
  const sender = {
    uid: `test-sender-uid${now}`,
    username: `test_sender${now}`,
    displayName: 'Test Sender',
    avatar: '🧪'
  }

  beforeEach(async () => {
    await friendRequestsDoc(testUserUid).set({
      incoming: {
        [sender.username]: {
          time: 123,
          displayName: sender.displayName,
          avatar: sender.avatar
        }
      }
    })

    // sender needs to 1. exist & 2. have matching outgoing request, or else the attempt to accept a friend request will be denied
    await userDoc(sender.uid).set({ username: sender.username, displayName: sender.displayName, avatar: sender.avatar })
    await friendRequestsDoc(sender.uid).set({ outgoing: { [testUserProfile.username]: {} } })
    await waitForRealtimeUpdates()
  })

  afterEach(async () => {
    await friendRequestsDoc(testUserUid).delete()
    await usernameDoc(sender.username).delete()
    await db.recursiveDelete(userDoc(sender.uid))
  })

  test('when a friend request is declined, the friend request is removed from the incoming requests array', async () => {
    const incomingRequest = requestsHandler.incomingRequests.find((request) => request.username = sender.username)
    await requestsHandler.declineFriendRequest(incomingRequest!)
    await waitForRealtimeUpdates()
    expect(requestsHandler.incomingRequests).toEqual([])
  })

  test('when a friend request is accepted, the friend request is removed from the incoming requests array', async () => {
    const incomingRequest = requestsHandler.incomingRequests.find((request) => request.username = sender.username)
    await requestsHandler.acceptFriendRequest(incomingRequest!)
    await waitForRealtimeUpdates()
    expect(requestsHandler.incomingRequests).toEqual([])
  })
})

describe('processing incoming and outgoing requests', () => {
  afterEach(async () => {
    await friendRequestsDoc(testUserUid).delete()
  })

  test('incoming and outgoing requests appear in their respective usernames arrays, sorted by newest first', async () => {
    await friendRequestsDoc(testUserUid).set({
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