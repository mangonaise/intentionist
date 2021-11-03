import * as functions from 'firebase-functions'
import admin = require('firebase-admin')

type UserDocumentData = {
  username: string,
  displayName: string,
  avatar: string
}

exports.onUpdateUserDocument = functions.firestore
  .document('users/{uid}')
  .onWrite((change) => {
    const { before, after } = change

    if (!change.after.exists) {
      // the account was deleted - not implemented
      return null
    }

    const oldData = {
      username: before.get('username'),
      displayName: before.get('displayName'),
      avatar: before.get('avatar')
    }

    const newData = {
      username: after.get('username'),
      displayName: after.get('displayName'),
      avatar: after.get('avatar')
    }

    if (hasUserDocumentDataChanged(oldData, newData)) {
      const db = admin.firestore()
      const batch = db.batch()

      if (oldData.username !== newData.username) {
        // delete the old username document from the usernames collection
        if (oldData.username) {
          batch.delete(db.collection('usernames').doc(oldData.username))
        }
      }

      // update the username document
      batch.set(db.collection('usernames').doc(newData.username), {
        displayName: newData.displayName,
        avatar: newData.avatar
      })

      return batch.commit()
    }

    return true
  })

function hasUserDocumentDataChanged(oldData: UserDocumentData, newData: UserDocumentData) {
  return oldData.username !== newData.username
    || oldData.displayName !== newData.displayName
    || oldData.avatar !== newData.avatar
}