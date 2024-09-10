import '@abraham/reflection'
import { waitForCloudFunctionExecution } from 'core/tests/cloud-functions/_helpers'
import { httpsCallable } from '@firebase/functions'
import { signOut } from '@firebase/auth'
import { maxFriends } from '@/logic/app/FriendsHandler'
import getDbShortcuts from '@/test-setup/getDbShortcuts'
import initializeFirebase from '@/firebase-setup/initializeFirebase'
import getFirebaseAdmin from '@/test-setup/getFirebaseAdmin'
import signInDummyUser from '@/test-setup/signInDummyUser'
import teardownFirebase from '@/test-setup/teardownFirebase'

//#region test setup

const firebase = initializeFirebase()
const { app, db } = getFirebaseAdmin()
const { userDoc, usernameDoc, friendsDoc, friendRequestsDoc } = getDbShortcuts(db)
const respondToFriendRequest = httpsCallable(firebase.functions, 'respondToFriendRequest')

const now = Date.now()
const authUserSeed = 'respondToFriendRequest'
let recipientUid: string
let senderUid = `test-sender-uid${now}`

const recipient = {
  username: `test_recipient${now}`,
  displayName: 'respondToFriendRequest Test Recipient',
  avatar: '🧪'
}

const sender = {
  username: `test_sender${now}`,
  displayName: 'respondToFriendRequest Test Sender',
  avatar: '📧'
}

beforeAll(async () => {
  recipientUid = (await signInDummyUser(authUserSeed)).uid
})

beforeEach(async () => {
  await setup()
})

afterEach(async () => {
  await teardown()
})

afterAll(async () => {
  await teardownFirebase(firebase)
  await app.delete()
})

async function setup() {
  await userDoc(recipientUid).set({ username: recipient.username, displayName: recipient.displayName, avatar: recipient.avatar })
  await userDoc(senderUid).set({ username: sender.username, displayName: sender.displayName, avatar: sender.avatar })

  // allow username docs to be generated
  await waitForCloudFunctionExecution()

  await friendRequestsDoc(recipientUid).set({
    incoming: {
      [sender.username]: { time: 123 }
    }
  })

  await friendRequestsDoc(senderUid).set({
    outgoing: {
      [recipient.username]: { time: 123 }
    }
  })
}

async function teardown() {
  await db.recursiveDelete(userDoc(recipientUid))
  await db.recursiveDelete(userDoc(senderUid))
  await usernameDoc(recipient.username).delete()
  await usernameDoc(sender.username).delete()
}

//#endregion

describe('making a valid response', () => {
  test(`declining a friend request removes the recipient's incoming request and the sender's outgoing request`, async () => {
    await respondToFriendRequest({ senderUsername: sender.username, accept: false })
    const recipientFriendRequests = (await (friendRequestsDoc(recipientUid).get())).data()
    const senderFriendRequests = (await (friendRequestsDoc(senderUid).get())).data()
    expect(recipientFriendRequests?.incoming).toEqual({})
    expect(senderFriendRequests?.outgoing).toEqual({})
  })

  test(`accepting a friend request removes the incoming/outgoing requests, and registers the users as friends with each other`, async () => {
    const result = await respondToFriendRequest({ senderUsername: sender.username, accept: true })
    const time = (result.data as any).time

    const recipientFriendRequests = (await (friendRequestsDoc(recipientUid).get())).data()
    const senderFriendRequests = (await (friendRequestsDoc(senderUid).get())).data()
    expect(recipientFriendRequests?.incoming).toEqual({})
    expect(senderFriendRequests?.outgoing).toEqual({})

    const recipientFriendsDoc = (await (friendsDoc(recipientUid).get())).data()
    const senderFriends = (await (friendsDoc(senderUid).get())).data()
    expect(recipientFriendsDoc).toEqual({
      friends: {
        [senderUid]: {
          time,
          username: sender.username,
          avatar: sender.avatar,
          displayName: sender.displayName
        }
      }
    })
    expect(senderFriends).toEqual({
      friends: {
        [recipientUid]: {
          time,
          username: recipient.username,
          avatar: recipient.avatar,
          displayName: recipient.displayName
        }
      }
    })
  })
})

describe('expected failures', () => {
  it('fails if the given sender user has not actually sent a friend request to the recipient', async () => {
    await friendRequestsDoc(senderUid).set({
      outgoing: {}
    })

    let fails = false
    try { await respondToFriendRequest({ senderUsername: sender.username, accept: true }) }
    catch { fails = true }

    expect(fails).toEqual(true)
  })

  it('fails if the sender has reached the maximum number of friends', async () => {
    let friends = {} as { [uid: string]: any }
    for (let i = 0; i < maxFriends; i++) {
      friends[`uid-${i}`] = { time: 123 }
    }
    await (friendsDoc(senderUid).set({ friends }))

    let failReason = ''
    try { await respondToFriendRequest({ senderUsername: sender.username, accept: true }) }
    catch (err) {
      failReason = (err as any).details?.failReason
    }

    expect(failReason).toEqual('sender-max-friends')
  })

  it('fails if the recipient has reached the maximum number of friends', async () => {
    let friends = {} as { [uid: string]: any }
    for (let i = 0; i < maxFriends; i++) {
      friends[`uid-${i}`] = { time: 123 }
    }
    await (friendsDoc(recipientUid).set({ friends }))

    let fails = false
    try { await respondToFriendRequest({ senderUsername: sender.username, accept: true }) }
    catch { fails = true }

    expect(fails).toEqual(true)
  })

  it('fails if the user is not authenticated', async () => {
    await signOut(firebase.auth)

    let fails = false
    try { await respondToFriendRequest({ senderUsername: sender.username, accept: true }) }
    catch { fails = true }

    expect(fails).toEqual(true)

    await signInDummyUser(authUserSeed)
  })
})