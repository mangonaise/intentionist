import type { UserData } from '../types'
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
  const time = admin.firestore.Timestamp.now().seconds

  await db.runTransaction(async (transaction) => {
    async function getSenderUserData(): Promise<UserData | undefined> {
      const senderUserDoc = await transaction.get(db.collection('users').doc(context.auth!.uid))
      const profile = senderUserDoc.data()
      if (!profile) return undefined
      return {
        uid: context.auth!.uid,
        username: profile.username,
        displayName: profile.displayName,
        avatar: profile.avatar
      }
    }

    async function getRecipientUserData(): Promise<UserData | undefined> {
      const querySnapshot = await transaction.get(db.collection('users').where('username', '==', recipientUsername))
      if (querySnapshot.empty) return undefined
      const recipientUserDoc = querySnapshot.docs[0]
      const profile = recipientUserDoc.data()
      return {
        uid: recipientUserDoc.id,
        username: profile.username,
        displayName: profile.displayName,
        avatar: profile.avatar
      }
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
    transaction.set(db.collection('users').doc(senderUserData.uid).collection('data').doc('friendRequests'), {
      outgoing: {
        [recipientUsername]: {
          time,
          displayName: recipientUserData.displayName,
          avatar: recipientUserData.avatar
        }
      }
    }, { merge: true })

    // create an incoming request in the recipient's /data/friendRequests/incoming field
    transaction.set(db.collection('users').doc(recipientUserData.uid).collection('data').doc('friendRequests'), {
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