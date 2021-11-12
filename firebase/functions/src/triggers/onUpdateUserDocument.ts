import type { Transaction } from 'firebase-admin/firestore'
import type { BasicUserData } from '../types'
import { firestore } from 'firebase-admin'
import * as functions from 'firebase-functions'
import admin = require('firebase-admin')

const db = admin.firestore()

exports.onUpdateUserDocument = functions.firestore
  .document('users/{uid}')
  .onWrite(async (change, context) => {
    const { before, after } = change
    const { uid } = context.params

    const isNewUser = !change.before.exists

    if (!change.after.exists) {
      // the account was deleted - not implemented
      return null
    }

    const oldUsername = before.get('username')
    const newData = {
      username: after.get('username'),
      displayName: after.get('displayName'),
      avatar: after.get('avatar')
    }

    await db.runTransaction(async (transaction) => {
      if (!isNewUser) {
        await updateDenormalizedData(transaction, uid, oldUsername, newData)
      }

      if (oldUsername !== newData.username) {
        // delete the old username document from the usernames collection
        if (oldUsername) {
          transaction.delete(db.collection('usernames').doc(oldUsername))
        }
      }

      // update the username document
      transaction.set(db.collection('usernames').doc(newData.username), {
        displayName: newData.displayName,
        avatar: newData.avatar
      })
    })

    return true
  })

async function updateDenormalizedData(transaction: Transaction, uid: string, oldUsername: string, newData: Omit<BasicUserData, 'uid'>) {
  const getFriendsDocsToUpdate = async () => {
    const collectionGroup = db.collectionGroup('userData').where(`friends.${uid}`, '!=', false)
    return await transaction.get(collectionGroup)
  }

  const getIncomingFriendRequestsDocsToUpdate = async () => {
    const collectionGroup = db.collectionGroup('userData').where(`incoming.${oldUsername}`, '!=', false)
    return await transaction.get(collectionGroup)
  }

  const getOutgoingFriendRequestsDocsToUpdate = async () => {
    const collectionGroup = db.collectionGroup('userData').where(`outgoing.${oldUsername}`, '!=', false)
    return await transaction.get(collectionGroup)
  }

  const [friendsDocsToUpdate, incomingFriendRequestsDocsToUpdate, outgoingFriendRequestsDocsToUpdate] = await Promise.all([
    getFriendsDocsToUpdate(),
    getIncomingFriendRequestsDocsToUpdate(),
    getOutgoingFriendRequestsDocsToUpdate()
  ])

  // --- update denormalized data ---

  friendsDocsToUpdate.forEach((doc) => {
    transaction.set(doc.ref, {
      friends: {
        [uid]: { ...newData }
      }
    }, { merge: true })
  })

  incomingFriendRequestsDocsToUpdate.forEach((doc) => {
    const time = doc.data().incoming[oldUsername].time ?? 0
    transaction.set(doc.ref, {
      incoming: {
        [oldUsername]: firestore.FieldValue.delete(),
        [newData.username]: {
          time,
          displayName: newData.displayName,
          avatar: newData.avatar
        }
      }
    }, { merge: true })
  })

  outgoingFriendRequestsDocsToUpdate.forEach((doc) => {
    const time = doc.data().outgoing[oldUsername].time ?? 0
    transaction.set(doc.ref, {
      outgoing: {
        [oldUsername]: firestore.FieldValue.delete(),
        [newData.username]: {
          time,
          displayName: newData.displayName,
          avatar: newData.avatar
        }
      }
    }, { merge: true })
  })
}