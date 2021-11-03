import * as functions from 'firebase-functions'
import admin = require('firebase-admin')

exports.onSetUsername = functions.firestore
  .document('users/{uid}')
  .onWrite((change, context) => {
    const { before, after } = change
    const { uid } = context.params

    if (!change.after.exists) {
      // the account was deleted - handle elsewhere
      return null
    }

    const oldUsername = before.get('username')
    const newUsername = after.get('username')

    if (oldUsername !== newUsername) {
      const db = admin.firestore()
      const batch = db.batch()

      // delete the old username document from the usernames collection
      if (oldUsername) {
        batch.delete(db.collection('usernames').doc(oldUsername))
      }

      // add a new username document
      batch.set(db.collection('usernames').doc(newUsername), { uid })

      return batch.commit()
    }

    return true
  })