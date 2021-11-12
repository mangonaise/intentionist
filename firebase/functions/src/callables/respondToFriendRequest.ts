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

    const [senderUserData, recipientUserData] = await Promise.all([getSenderUserData(), getRecipientUserData()])

    if (!recipientUserData) throw new functions.https.HttpsError('aborted', 'Recipient user could not be found')
    if (!senderUserData) throw new functions.https.HttpsError('aborted', 'Sender user could not be found')

    transaction.set(friendRequestsDoc(senderUserData.uid), {
      outgoing: { [recipientUserData.username]: firestore.FieldValue.delete() }
    }, { merge: true })

    transaction.set(friendRequestsDoc(recipientUserData.uid), {
      incoming: { [senderUsername]: firestore.FieldValue.delete() }
    }, { merge: true })

    if (accept === true) {
      const [wasFriendRequestSent, senderFriendsCount, recipientFriendsCount] = await Promise.all([
        getWasFriendRequestSent(senderUserData.uid, recipientUserData.username),
        getFriendsCount(senderUserData.uid),
        getFriendsCount(recipientUserData.uid)
      ])

      if (!wasFriendRequestSent) {
        throw new functions.https.HttpsError('aborted', 'No friend request was sent by that user')
      }

      if (senderFriendsCount >= 50) {
        throw new functions.https.HttpsError('aborted', 'The sender has reached the maximum number of friends', {
          failReason: 'sender-max-friends'
        })
      }

      if (recipientFriendsCount >= 50) {
        throw new functions.https.HttpsError('aborted', 'The recipient has reached the maximum number of friends')
      }

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

async function getWasFriendRequestSent(senderUid: string, recipientUsername: string) {
  const senderFriendRequestsDoc = await friendRequestsDoc(senderUid).get()
  return senderFriendRequestsDoc.data()?.outgoing?.[recipientUsername] !== undefined
}

async function getFriendsCount(uid: string) {
  const friends = (await friendsDoc(uid).get()).data()?.friends ?? {}
  return Object.keys(friends).length
}