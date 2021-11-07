import { firestore } from 'firebase-admin'
import * as functions from 'firebase-functions'
import admin = require('firebase-admin')

const db = admin.firestore()

const friendRequestsDoc = (uid: string) => db.collection('users').doc(uid).collection('data').doc('friendRequests')
const friendsDoc = (uid: string) => db.collection('users').doc(uid).collection('data').doc('friends')

exports.respondToFriendRequest = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be authenticated')
  }
  if (!data || !data.senderUsername || data.accept === undefined) {
    throw new functions.https.HttpsError('invalid-argument', '"senderUsername" and "accept" arguments were not provided')
  }

  const { senderUsername, accept } = data
  const recipientUid = context.auth.uid

  const time = admin.firestore.Timestamp.now().seconds

  const senderUid = await db.runTransaction(async (transaction) => {
    async function getSenderUid() {
      const querySnapshot = await transaction.get(db.collection('users').where('username', '==', senderUsername))
      return querySnapshot.empty ? undefined : querySnapshot.docs[0].id
    }

    async function getRecipientUsername() {
      const responderUserDoc = await transaction.get(db.collection('users').doc(recipientUid))
      return responderUserDoc.data()?.username as string | undefined
    }

    async function wasFriendRequestSent(senderUid: string, recipientUsername: string) {
      const senderFriendRequestsDoc = await transaction.get(friendRequestsDoc(senderUid))
      return senderFriendRequestsDoc.data()?.outgoing?.[recipientUsername] !== undefined
    }

    const [senderUid, recipientUsername] = await Promise.all([getSenderUid(), getRecipientUsername()])

    if (!recipientUsername) throw new functions.https.HttpsError('aborted', 'Recipient user could not be found')
    if (!senderUid) throw new functions.https.HttpsError('aborted', 'Sender user could not be found')

    if (await wasFriendRequestSent(senderUid, recipientUsername) === false) {
      throw new functions.https.HttpsError('aborted', 'No friend request was sent by that user')
    }

    transaction.set(friendRequestsDoc(senderUid), {
      outgoing: {
        [recipientUsername]: firestore.FieldValue.delete()
      }
    }, { merge: true })

    transaction.set(friendRequestsDoc(recipientUid), {
      incoming: {
        [senderUsername]: firestore.FieldValue.delete()
      }
    }, { merge: true })

    if (accept === true) {
      transaction.set(friendsDoc(senderUid), {
        uids: {
          [recipientUid]: { time }
        }
      }, { merge: true })
      transaction.set(friendsDoc(recipientUid), {
        uids: {
          [senderUid]: { time }
        }
      }, { merge: true })
    }

    return senderUid
  })

  if (accept === true) {
    return {
      time,
      senderUid
    }
  }

  return null
})