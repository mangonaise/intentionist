import * as functions from 'firebase-functions'
import { firestore } from 'firebase-admin'
import admin = require('firebase-admin')

const db = admin.firestore()

exports.cancelOutgoingFriendRequest = functions.https.onCall((data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be authenticated')
  }
  if (!data || !data.recipientUsername) {
    throw new functions.https.HttpsError('invalid-argument', 'No recipient username was specified')
  }

  const recipientUsername = data.recipientUsername
  const senderUid = context.auth.uid

  return db.runTransaction(async (transaction) => {
    async function getSenderUsername() {
      const senderUserDoc = await transaction.get(db.collection('users').doc(senderUid))
      return senderUserDoc.data()?.username as string | undefined
    }

    async function getRecipientUid() {
      const querySnapshot = await transaction.get(db.collection('users').where('username', '==', recipientUsername))
      return querySnapshot.empty ? undefined : querySnapshot.docs[0].id
    }

    const [senderUsername, recipientUid] = await Promise.all([getSenderUsername(), getRecipientUid()])

    if (!senderUsername) throw new functions.https.HttpsError('aborted', 'Sender user could not be found')
    if (!recipientUid) throw new functions.https.HttpsError('aborted', 'Recipient user could not be found')

    // remove the outgoing request from the sender's /data/friendRequests/outgoing field
    transaction.set(db.collection('users').doc(senderUid).collection('data').doc('friendRequests'), {
      outgoing: {
        [recipientUsername]: firestore.FieldValue.delete()
      }
    }, { merge: true })

    // remove the incoming request from the recipient's /data/friendRequests/incoming field
    transaction.set(db.collection('users').doc(recipientUid).collection('data').doc('friendRequests'), {
      incoming: {
        [senderUsername]: firestore.FieldValue.delete()
      }
    }, { merge: true })
  })
})