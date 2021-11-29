import * as functions from 'firebase-functions'
import admin = require('firebase-admin')
import { firestore } from 'firebase-admin'
import { getFriendRequestsDocShortcut, getUserDataByUid, getUserDataByUsername } from '../helpers'

const db = admin.firestore()

const friendRequestsDoc = getFriendRequestsDocShortcut(db)

exports.cancelOutgoingFriendRequest = functions.https.onCall((data, context) => {
  if (!context.app && !process.env.FUNCTIONS_EMULATOR) {
    throw new functions.https.HttpsError('failed-precondition', 'Request did not originate from an App Check verified app.')
  }
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

    // remove the outgoing request from the sender's /userData/friendRequests/outgoing field
    transaction.set(friendRequestsDoc(senderUid), {
      outgoing: {
        [recipientUsername]: firestore.FieldValue.delete()
      }
    }, { merge: true })

    if (recipientUid) {
      // remove the incoming request from the recipient's /userData/friendRequests/incoming field
      transaction.set(friendRequestsDoc(recipientUid), {
        incoming: {
          [senderUsername]: firestore.FieldValue.delete()
        }
      }, { merge: true })
    }
  })
})