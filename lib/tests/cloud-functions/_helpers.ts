import type { Firestore } from 'firebase-admin/firestore'

export function getDbShortcuts(db: Firestore) {
  const userDoc = (uid: string) => db.collection('users').doc(uid)
  const usernameDoc = (username: string) => db.collection('usernames').doc(username)
  const friendsDoc = (uid: string) => userDoc(uid).collection('data').doc('friends')
  const friendRequestsDoc = (uid: string) => userDoc(uid).collection('data').doc('friendRequests')

  return {
    userDoc,
    usernameDoc,
    friendsDoc,
    friendRequestsDoc
  }
}

export async function waitForCloudFunctionExecution(time = 2500) {
  return new Promise((resolve) => setTimeout(resolve, time))
}