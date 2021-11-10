import * as functions from 'firebase-functions'
import admin = require('firebase-admin')
import { firestore } from 'firebase-admin'
import { getUserDataByUid, getUserDataByUsername  } from '../helpers'

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
    const getSenderUsername = async () => (await getUserDataByUid(transaction, db, senderUid))?.username
    const getRecipientUid = async () => (await getUserDataByUsername(transaction, db, recipientUsername))?.uid

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