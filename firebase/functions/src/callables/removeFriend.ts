import * as functions from 'firebase-functions'
import admin = require('firebase-admin')
import { firestore } from 'firebase-admin'
import { getFriendsDocShortcut } from '../helpers'

const db = admin.firestore()
const friendsDoc = getFriendsDocShortcut(db)

exports.removeFriend = functions.https.onCall((data, context) => {
  if (!context.app && !process.env.FUNCTIONS_EMULATOR) {
    throw new functions.https.HttpsError('failed-precondition', 'Request did not originate from an App Check verified app.')
  }
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be authenticated')
  }
  if (!data || !data.uid) {
    throw new functions.https.HttpsError('invalid-argument', 'No friend uid was specified.')
  }

  const userAUid = context.auth.uid
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