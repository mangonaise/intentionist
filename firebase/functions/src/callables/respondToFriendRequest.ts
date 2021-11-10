import * as functions from 'firebase-functions'
import admin = require('firebase-admin')
import { firestore } from 'firebase-admin'
import { getFriendRequestsDocShortcut, getFriendsDocShortcut, getUserDataByUid, getUserDataByUsername } from '../helpers'

const db = admin.firestore()

const friendsDoc = getFriendsDocShortcut(db)
const friendRequestsDoc = getFriendRequestsDocShortcut(db)

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
    const getSenderUserData = async () => (await getUserDataByUsername(transaction, db, senderUsername))
    const getRecipientUserData = async () => (await getUserDataByUid(transaction, db, context.auth!.uid))

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
      outgoing: { [recipientUserData.username]: firestore.FieldValue.delete() }
    }, { merge: true })

    transaction.set(friendRequestsDoc(recipientUserData.uid), {
      incoming: { [senderUsername]: firestore.FieldValue.delete() }
    }, { merge: true })

    if (accept === true) {
      transaction.set(friendsDoc(senderUserData.uid), {
        friends: {
          [recipientUserData.uid]: {
            time,
            username: recipientUserData.username,
            displayName: recipientUserData.displayName,
            avatar: recipientUserData.avatar
          }
        }
      }, { merge: true })
      transaction.set(friendsDoc(recipientUserData.uid), {
        friends: {
          [senderUserData.uid]: {
            time,
            username: senderUserData.username,
            displayName: senderUserData.displayName,
            avatar: senderUserData.avatar
          }
        }
      }, { merge: true })
    }
  })

  return { time }
})