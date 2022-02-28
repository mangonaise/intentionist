import * as functions from 'firebase-functions'
import admin = require('firebase-admin')
import { firestore } from 'firebase-admin'
import { getFriendsDocShortcut, rejectInvalidFunctionCall } from '../helpers'

const db = admin.firestore()
const friendsDoc = getFriendsDocShortcut(db)

exports.removeFriend = functions.https.onCall((data, context) => {
  rejectInvalidFunctionCall({ context, requiredData: [data?.uid] })

  const userAUid = context.auth!.uid
  const userBUid = data.uid

  const batch = db.batch()

  batch.set(friendsDoc(userAUid), {
    friends: {
      [userBUid]: firestore.FieldValue.delete()
    }
  }, { merge: true })

  batch.set(friendsDoc(userBUid), {
    friends: {
      [userAUid]: firestore.FieldValue.delete()
    }
  }, { merge: true })

  return batch.commit()
})