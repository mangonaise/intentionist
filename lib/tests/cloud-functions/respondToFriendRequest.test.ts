import '@abraham/reflection'
import { firestore } from 'firebase-admin'
import { waitForCloudFunctionExecution } from 'lib/tests/cloud-functions/_helpers'
import { httpsCallable } from '@firebase/functions'
import { signOut } from '@firebase/auth'
import initializeFirebase from '@/firebase-setup/initializeFirebase'
import getFirebaseAdmin from '@/test-setup/getFirebaseAdmin'
import signInDummyUser from '@/test-setup/signInDummyUser'
import teardownFirebase from '@/test-setup/teardownFirebase'

// 🔨

const firebase = initializeFirebase()
const { app, db } = getFirebaseAdmin()

const respondToFriendRequest = httpsCallable(firebase.functions, 'respondToFriendRequest')

const usernameDoc = (username: string) => db.collection('usernames').doc(username)
const userDoc = (uid: string) => db.collection('users').doc(uid)
const friendRequestsDoc = (uid: string) => userDoc(uid).collection('data').doc('friendRequests')
const friendsDoc = (uid: string) => userDoc(uid).collection('data').doc('friends')

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
  avatar: '✉️'
}

const otherUsername = 'some_other_username'

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
      [sender.username]: { time: 123 },
      [otherUsername]: { time: 123 }
    }
  })

  await friendRequestsDoc(senderUid).set({
    outgoing: {
      [recipient.username]: { time: 123 },
      [otherUsername]: { time: 123 }
    }
  })
}

async function teardown() {
  await db.recursiveDelete(userDoc(recipientUid))
  await db.recursiveDelete(userDoc(senderUid))
  await usernameDoc(recipient.username).delete()
  await usernameDoc(sender.username).delete()
}

// 🧪

describe('making a valid response', () => {
  test(`declining a friend request removes the recipient's incoming request and the sender's outgoing request`, async () => {
    await respondToFriendRequest({ senderUsername: sender.username, accept: false })
    const recipientFriendRequests = (await (friendRequestsDoc(recipientUid).get())).data()
    const senderFriendRequests = (await (friendRequestsDoc(senderUid).get())).data()
    expect(recipientFriendRequests?.incoming).toEqual({ [otherUsername]: { time: 123 } })
    expect(senderFriendRequests?.outgoing).toEqual({ [otherUsername]: { time: 123 } })
  })

  test(`accepting a friend request removes the incoming/outgoing requests, and registers the users as friends with each other`, async () => {
    const result = await respondToFriendRequest({ senderUsername: sender.username, accept: true })
    const time = (result.data as any).time

    const recipientFriendRequests = (await (friendRequestsDoc(recipientUid).get())).data()
    const senderFriendRequests = (await (friendRequestsDoc(senderUid).get())).data()
    expect(recipientFriendRequests?.incoming).toEqual({ [otherUsername]: { time: 123 } })
    expect(senderFriendRequests?.outgoing).toEqual({ [otherUsername]: { time: 123 } })

    const recipientFriends = (await (friendsDoc(recipientUid).get())).data()
    const senderFriends = (await (friendsDoc(senderUid).get())).data()
    expect(recipientFriends).toEqual({
      [senderUid]: {
        time,
        username: sender.username,
        avatar: sender.avatar,
        displayName: sender.displayName
      }
    })
    expect(senderFriends).toEqual({
      [recipientUid]: {
        time,
        username: recipient.username,
        avatar: recipient.avatar,
        displayName: recipient.displayName
      }
    })
  })
})

describe('expected failures', () => {
  it('fails if the user is not authenticated', async () => {
    await signOut(firebase.auth)
    let fails = false
    try { await respondToFriendRequest({ senderUsername: sender.username, accept: true }) }
    catch { fails = true }
    expect(fails).toEqual(true)
    await signInDummyUser(authUserSeed)
  })

  it('fails if the sender user provided has not sent a friend request to the recipient', async () => {
    await friendRequestsDoc(senderUid).set({
      outgoing: {
        [recipient.username]: firestore.FieldValue.delete()
      }
    }, { merge: true })
    let fails = false
    try { await respondToFriendRequest({ senderUsername: sender.username, accept: true }) }
    catch { fails = true }
    expect(fails).toEqual(true)
  })
})