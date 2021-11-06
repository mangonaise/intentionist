import * as functions from 'firebase-functions'
import admin = require('firebase-admin')

const db = admin.firestore()

exports.sendFriendRequest = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be authenticated')
  }

  if (!data || !data.recipientUsername) {
    throw new functions.https.HttpsError('invalid-argument', 'No recipient username was specified')
  }

  const recipientUsername = data.recipientUsername
  const senderUid = context.auth.uid

  const time = admin.firestore.Timestamp.now().seconds

  await db.runTransaction(async (transaction) => {
    async function getSenderUsername() {
      const senderUserDoc = await transaction.get(db.collection('users').doc(senderUid))
      return senderUserDoc.data()?.username as string | undefined
    }

    async function getRecipientUid() {
      const querySnapshot = await transaction.get(db.collection('users').where('username', '==', recipientUsername))
      return querySnapshot.empty ? undefined : querySnapshot.docs[0].id
    }

    async function getRecipientIncomingFriendRequestsCount(recipientUid: string) {
      const docRef = db
        .collection('users')
        .doc(recipientUid)
        .collection('data')
        .doc('friendRequests')
      const recipientFriendRequestsDoc = await transaction.get(docRef)
      const incomingRequests = recipientFriendRequestsDoc.data()?.incoming ?? {}
      return Object.keys(incomingRequests).length
    }

    const [senderUsername, recipientUid] = await Promise.all([getSenderUsername(), getRecipientUid()])

    if (!senderUsername) throw new functions.https.HttpsError('aborted', 'Sender user could not be found')
    if (!recipientUid) throw new functions.https.HttpsError('aborted', 'Recipient user could not be found')
    if (senderUid === recipientUid) throw new functions.https.HttpsError('aborted', 'Attempted to send friend request to self')

    if (await getRecipientIncomingFriendRequestsCount(recipientUid) >= 100) {
      throw new functions.https.HttpsError('aborted', 'Recipient has too many incoming friend requests', {
        reason: 'recipient-max-requests'
      })
    }

    // create an outgoing request in the sender's /data/friendRequests/outgoing field
    transaction.set(db.collection('users').doc(senderUid).collection('data').doc('friendRequests'), {
      outgoing: {
        [recipientUsername]: { time }
      }
    }, { merge: true })

    // create an incoming request in the recipient's /data/friendRequests/incoming field
    transaction.set(db.collection('users').doc(recipientUid).collection('data').doc('friendRequests'), {
      incoming: {
        [senderUsername]: { time }
      }
    }, { merge: true })
  })

  return {
    time
  }
})