import '@abraham/reflection'
import { container } from 'tsyringe'
import { signOut, User } from '@firebase/auth'
import { httpsCallable } from '@firebase/functions'
import { waitForCloudFunctionExecution } from './_helpers'
import initializeFirebase from '@/firebase-setup/initializeFirebase'
import getFirebaseAdmin from '@/test-setup/getFirebaseAdmin'
import signInDummyUser from '@/test-setup/signInDummyUser'
import AuthHandler from '@/logic/app/AuthHandler'

const { app, db } = getFirebaseAdmin()
const firebase = initializeFirebase()

const sendFriendRequest = httpsCallable(firebase.functions, 'sendFriendRequest')

let sender: User
const senderUsername = 'test_sender_username'
const recipientUid = 'test-recipient-uid'
const recipientUsername = 'test_recipient_username'

beforeAll(async () => {
  sender = await signInDummyUser()
})

afterAll(async () => {
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
    avatar: '✉️',
  })
  await waitForCloudFunctionExecution()
}

async function teardown() {
  await db.recursiveDelete(db.collection('users').doc(sender.uid))
  await db.recursiveDelete(db.collection('users').doc(recipientUid))
  await db.collection('usernames').doc(senderUsername).delete()
  await db.collection('usernames').doc(recipientUsername).delete()
}

describe('sending a valid friend request', () => {
  test(`the sender and recipient's /data/friendRequests documents are updated correctly with the outgoing and incoming request`, async () => {
    await setup()
    const result = await sendFriendRequest({ recipientUsername })
    const resultData = result.data as { time: Date }

    const senderFriendRequestsDoc = await db
      .collection('users')
      .doc(sender.uid)
      .collection('data')
      .doc('friendRequests')
      .get()

    expect(senderFriendRequestsDoc.data()?.outgoing?.[recipientUsername]).toEqual({ time: resultData.time })

    const recipientFriendRequestsDoc = await db
      .collection('users')
      .doc(recipientUid)
      .collection('data')
      .doc('friendRequests')
      .get()

    expect(recipientFriendRequestsDoc.data()?.incoming?.[senderUsername]).toEqual({ time: resultData.time })
    await teardown()
  })
})

describe('expected failures', () => {
  it('fails if the user is not authenticated', async () => {
    await signOut(container.resolve(AuthHandler).auth)
    let fails = false
    try { await sendFriendRequest({ recipientUsername }) }
    catch { fails = true }
    expect(fails).toEqual(true)
    await signInDummyUser()
  })

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
    await setup()
    let fails = false
    try { await sendFriendRequest({ recipientUsername: senderUsername }) }
    catch (err) { fails = true }
    expect(fails).toEqual(true)
    await teardown()
  })

  it('fails if the sender does not have a user document', async () => {
    await setup()
    await db.collection('users').doc(sender.uid).delete()

    let fails = false
    try { await sendFriendRequest({ recipientUsername }) }
    catch (err) { fails = true }
    expect(fails).toEqual(true)
    await teardown()
  })

  it('fails if the recipient already has at least 100 incoming friend requests', async () => {
    await setup()
    const recipientFriendRequestsDocRef = db.collection('users').doc(recipientUid).collection('data').doc('friendRequests')
    await recipientFriendRequestsDocRef.delete()

    let incoming: { [username: string]: { time: number } } = {}
    for (let i = 0; i < 100; i++) {
      incoming[`req_${i}`] = { time: 123 }
    }
    await recipientFriendRequestsDocRef.set({ incoming })

    let reason = ''
    try { await sendFriendRequest({ recipientUsername }) }
    catch (err) {
      reason = (err as any).details?.reason
    }
    expect(reason).toEqual('recipient-max-requests')
    await teardown()
  })
})