import * as functions from 'firebase-functions'
import type { BasicUserData } from './types'
import type { Firestore, Transaction } from 'firebase-admin/firestore'

export function rejectInvalidFunctionCall(
  { context, requiredData }: {
    context: functions.https.CallableContext,
    requiredData: any[]
  }
) {
  if (!context.app && !process.env.FUNCTIONS_EMULATOR) {
    throw new functions.https.HttpsError('failed-precondition', 'Request did not originate from an App Check verified app.')
  }
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be authenticated.')
  }
  for (const item of requiredData) {
    if (!item) throw new functions.https.HttpsError('invalid-argument', 'Missing or invalid function arguments.')
  }
}

export function getUserDocShortcut(db: Firestore) {
  return (uid: string) => db.collection('users').doc(uid)
}

export function getUsernameDocShortcut(db: Firestore) {
  return (username: string) => db.collection('usernames').doc(username)
}

export function getFriendsDocShortcut(db: Firestore) {
  return (uid: string) => db.collection('users').doc(uid).collection('userData').doc('friends')
}

export function getFriendRequestsDocShortcut(db: Firestore) {
  return (uid: string) => db.collection('users').doc(uid).collection('userData').doc('friendRequests')
}

export async function getUserDataByUsername(transaction: Transaction, db: Firestore, username: string): Promise<BasicUserData | undefined> {
  const querySnapshot = await transaction.get(db.collection('users').where('username', '==', username))
  if (querySnapshot.empty) return undefined
  const userDoc = querySnapshot.docs[0]
  const profile = userDoc.data()
  return {
    uid: userDoc.id,
    username: username,
    displayName: profile.displayName,
    avatar: profile.avatar
  }
}

export async function getUserDataByUid(transaction: Transaction, db: Firestore, uid: string): Promise<BasicUserData | undefined> {
  const userDoc = await transaction.get(db.collection('users').doc(uid))
  const profile = userDoc.data()
  if (!profile) return undefined
  return {
    uid: uid,
    username: profile.username,
    displayName: profile.displayName,
    avatar: profile.avatar
  }
}