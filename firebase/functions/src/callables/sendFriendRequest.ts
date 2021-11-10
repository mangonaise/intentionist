import * as functions from 'firebase-functions'
import admin = require('firebase-admin')
import { getUserDataByUid, getUserDataByUsername, getFriendRequestsDocShortcut } from '../helpers'

const db = admin.firestore()
const friendRequestsDoc = getFriendRequestsDocShortcut(db)

exports.sendFriendRequest = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be authenticated')
  }

  if (!data || !data.recipientUsername) {
    throw new functions.https.HttpsError('invalid-argument', 'No recipient username was specified')
  }

  const recipientUsername = data.recipientUsername
  const time = admin.firestore.Timestamp.now().seconds

  await db.runTransaction(async (transaction) => {
    const getSenderUserData = async () => (await getUserDataByUid(transaction, db, context.auth!.uid))
    const getRecipientUserData = async () => (await getUserDataByUsername(transaction, db, recipientUsername))

    async function getRecipientIncomingFriendRequestsCount(recipientUid: string) {
      const docRef = friendRequestsDoc(recipientUid)
      const recipientFriendRequestsDoc = await transaction.get(docRef)
      const incomingRequests = recipientFriendRequestsDoc.data()?.incoming ?? {}
      return Object.keys(incomingRequests).length
    }

    const [senderUserData, recipientUserData] = await Promise.all([getSenderUserData(), getRecipientUserData()])

    if (!senderUserData) throw new functions.https.HttpsError('aborted', 'Sender user could not be found')
    if (!recipientUserData) throw new functions.https.HttpsError('aborted', 'Recipient user could not be found')
    if (senderUserData.username === recipientUserData.username) {
      throw new functions.https.HttpsError('aborted', 'Attempted to send friend request to self')
    }

    if (await getRecipientIncomingFriendRequestsCount(recipientUserData.uid) >= 100) {
      throw new functions.https.HttpsError('aborted', 'Recipient has too many incoming friend requests', {
        reason: 'recipient-max-requests'
      })
    }

    // create an outgoing request in the sender's /data/friendRequests/outgoing field
    transaction.set(friendRequestsDoc(senderUserData.uid), {
      outgoing: {
        [recipientUsername]: {
          time,
          displayName: recipientUserData.displayName,
          avatar: recipientUserData.avatar
        }
      }
    }, { merge: true })

    // create an incoming request in the recipient's /data/friendRequests/incoming field
    transaction.set(friendRequestsDoc(recipientUserData.uid), {
      incoming: {
        [senderUserData.username]: {
          time,
          displayName: senderUserData.displayName,
          avatar: senderUserData.avatar 
        }
      }
    }, { merge: true })
  })

  return {
    time
  }
})