import type { UserData } from '../types'
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

  const time = admin.firestore.Timestamp.now().seconds

  await db.runTransaction(async (transaction) => {
    async function getSenderUserData(): Promise<UserData | undefined> {
      const querySnapshot = await transaction.get(db.collection('users').where('username', '==', senderUsername))
      if (querySnapshot.empty) return undefined
      const senderUserDoc = querySnapshot.docs[0]
      const profile = senderUserDoc.data()
      return {
        uid: senderUserDoc.id,
        username: senderUsername,
        displayName: profile.displayName,
        avatar: profile.avatar
      }
    }

    async function getRecipientUserData(): Promise<UserData | undefined> {
      const recipientUserDoc = await transaction.get(db.collection('users').doc(context.auth!.uid))
      const profile = recipientUserDoc.data()
      if (!profile) return undefined
      return {
        uid: context.auth!.uid,
        username: profile.username,
        displayName: profile.displayName,
        avatar: profile.avatar
      }
    }

    async function wasFriendRequestSent(senderUid: string, recipientUsername: string) {
      const senderFriendRequestsDoc = await transaction.get(friendRequestsDoc(senderUid))
      return senderFriendRequestsDoc.data()?.outgoing?.[recipientUsername] !== undefined
    }

    const [senderUserData, recipientUserData] = await Promise.all([getSenderUserData(), getRecipientUserData()])

    if (!recipientUserData) throw new functions.https.HttpsError('aborted', 'Recipient user could not be found')
    if (!senderUserData) throw new functions.https.HttpsError('aborted', 'Sender user could not be found')

    if (await wasFriendRequestSent(senderUserData.uid, recipientUserData.username) === false) {
      throw new functions.https.HttpsError('aborted', 'No friend request was sent by that user')
    }

    transaction.set(friendRequestsDoc(senderUserData.uid), {
      outgoing: {
        [recipientUserData.username]: firestore.FieldValue.delete()
      }
    }, { merge: true })

    transaction.set(friendRequestsDoc(recipientUserData.uid), {
      incoming: {
        [senderUsername]: firestore.FieldValue.delete()
      }
    }, { merge: true })

    if (accept === true) {
      transaction.set(friendsDoc(senderUserData.uid), {
        [recipientUserData.uid]: {
          time,
          username: recipientUserData.username,
          displayName: recipientUserData.displayName,
          avatar: recipientUserData.avatar
        }
      }, { merge: true })
      transaction.set(friendsDoc(recipientUserData.uid), {
        [senderUserData.uid]: {
          time,
          username: senderUserData.username,
          displayName: senderUserData.displayName,
          avatar: senderUserData.avatar
        }
      }, { merge: true })
    }
  })

  return { time }
})