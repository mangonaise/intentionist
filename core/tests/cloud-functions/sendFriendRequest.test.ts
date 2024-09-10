import '@abraham/reflection'
import { container } from 'tsyringe'
import { signOut, User } from '@firebase/auth'
import { httpsCallable } from '@firebase/functions'
import { waitForCloudFunctionExecution } from './_helpers'
import getDbShortcuts from '@/test-setup/getDbShortcuts'
import initializeFirebase from '@/firebase-setup/initializeFirebase'
import getFirebaseAdmin from '@/test-setup/getFirebaseAdmin'
import signInDummyUser from '@/test-setup/signInDummyUser'
import teardownFirebase from '@/test-setup/teardownFirebase'
import AuthHandler from '@/logic/app/AuthHandler'

//#region test setup 

const now = Date.now()
const firebase = initializeFirebase()
const { app, db } = getFirebaseAdmin()
const { friendRequestsDoc } = getDbShortcuts(db)
const sendFriendRequest = httpsCallable(firebase.functions, 'sendFriendRequest')

let sender: User
const authUserSeed = 'sendFriendRequest'
const senderUsername = `test_sender_username${now}`
const recipientUid = `test-recipient-uid${now}`
const recipientUsername = `test_recipient_username${now}`

beforeAll(async () => {
  sender = await signInDummyUser(authUserSeed)
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
  await db.collection('users').doc(recipientUid).set({
    username: recipientUsername,
    displayName: 'Test Friend Request Recipient',
    avatar: '🧪'
  })
  await db.collection('users').doc(sender.uid).set({
    username: senderUsername,
    displayName: 'Test Friend Request Sender',
    avatar: '📧',
  })
  await waitForCloudFunctionExecution()
}

async function teardown() {
  await db.recursiveDelete(db.collection('users').doc(sender.uid))
  await db.recursiveDelete(db.collection('users').doc(recipientUid))
  await db.collection('usernames').doc(senderUsername).delete()
  await db.collection('usernames').doc(recipientUsername).delete()
}

//#endregion

describe('sending a valid friend request', () => {
  test(`the sender and recipient's friendRequests documents are updated correctly with the outgoing and incoming requests`, async () => {
    const result = await sendFriendRequest({ recipientUsername })
    const { time } = result.data as { time: Date }

    const senderFriendRequestsDoc = await friendRequestsDoc(sender.uid).get()
    expect(senderFriendRequestsDoc.data()?.outgoing?.[recipientUsername]).toEqual({
      displayName: 'Test Friend Request Recipient',
      avatar: '🧪',
      time
    })

    const recipientFriendRequestsDoc = await friendRequestsDoc(recipientUid).get()
    expect(recipientFriendRequestsDoc.data()?.incoming?.[senderUsername]).toEqual({
      displayName: 'Test Friend Request Sender',
      avatar: '📧',
      time
    })
  })
})

describe('expected failures', () => {
  it('fails if no recipient username is specified', async () => {
    let fails = false
    try { await sendFriendRequest({}) }
    catch { fails = true }

    expect(fails).toEqual(true)
  })

  it('fails if the provided recipient username does not correspond to an existing user', async () => {
    let fails = false
    try { await sendFriendRequest({ recipientUsername: 'non_existent_username' }) }
    catch (err) { fails = true }

    expect(fails).toEqual(true)
  })

  it(`fails if the user tries to send a friend request to themself`, async () => {
    let fails = false
    try { await sendFriendRequest({ recipientUsername: senderUsername }) }
    catch (err) { fails = true }

    expect(fails).toEqual(true)
  })

  it('fails if the sender does not have a user document', async () => {
    await db.collection('users').doc(sender.uid).delete()

    let fails = false
    try { await sendFriendRequest({ recipientUsername }) }
    catch (err) { fails = true }

    expect(fails).toEqual(true)
  })

  it('fails if the recipient already has at least 100 incoming friend requests', async () => {
    let incoming: { [username: string]: { time: number } } = {}
    for (let i = 0; i < 100; i++) {
      incoming[`req_${i}`] = { time: 123 }
    }
    await friendRequestsDoc(recipientUid).set({ incoming })

    let failReason = ''
    try { await sendFriendRequest({ recipientUsername }) }
    catch (err) {
      failReason = (err as any).details?.failReason
    }

    expect(failReason).toEqual('recipient-max-requests')
  })

  it('fails if the sender already has at least 100 outgoing friend requests', async () => {
    let outgoing: { [username: string]: { time: number } } = {}
    for (let i = 0; i < 100; i++) {
      outgoing[`req_${i}`] = { time: 123 }
    }
    await friendRequestsDoc(sender.uid).set({ outgoing })

    let failReason = ''
    try { await sendFriendRequest({ recipientUsername }) }
    catch (err) {
      failReason = (err as any).details?.failReason
    }

    expect(failReason).toEqual('sender-max-requests')
  })

  it('fails if the user is not authenticated', async () => {
    await signOut(container.resolve(AuthHandler).auth)

    let fails = false
    try { await sendFriendRequest({ recipientUsername }) }
    catch { fails = true }

    expect(fails).toEqual(true)

    await signInDummyUser(authUserSeed)
  })
})