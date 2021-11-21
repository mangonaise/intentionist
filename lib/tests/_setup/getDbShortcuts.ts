import type { Firestore } from 'firebase-admin/firestore'

export default function getDbShortcuts(db: Firestore) {
  const userDoc = (uid: string) => db.collection('users').doc(uid)
  const usernameDoc = (username: string) => db.collection('usernames').doc(username)
  const userDataCollection = (uid: string) => userDoc(uid).collection('userData')
  const friendsDoc = (uid: string) => userDataCollection(uid).doc('friends')
  const friendRequestsDoc = (uid: string) => userDataCollection(uid).doc('friendRequests')
  const habitDoc = (uid: string, habitId: string) => userDoc(uid).collection('habits').doc(habitId)

  return {
    userDoc,
    usernameDoc,
    userDataCollection,
    friendsDoc,
    friendRequestsDoc,
    habitDoc
  }
}