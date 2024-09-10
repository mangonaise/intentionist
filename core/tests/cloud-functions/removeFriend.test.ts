import '@abraham/reflection'
import { httpsCallable } from '@firebase/functions'
import { signOut } from '@firebase/auth'
import getDbShortcuts from '@/test-setup/getDbShortcuts'
import getFirebaseAdmin from '@/test-setup/getFirebaseAdmin'
import signInDummyUser from '@/test-setup/signInDummyUser'
import initializeFirebase, { registerFirebaseInjectionTokens } from '@/firebase-setup/initializeFirebase'

//#region test setup

const now = Date.now()
const firebase = initializeFirebase()
const { app, db } = getFirebaseAdmin()
const { userDoc, friendsDoc } = getDbShortcuts(db)
const removeFriend = httpsCallable(firebase.functions, 'removeFriend')

let userAUid: string
const userBUid = `test-friend-uid${now}`
const authUserSeed = 'removeFriend'

beforeAll(async () => {
  userAUid = (await signInDummyUser(authUserSeed)).uid
})

beforeEach(async () => {
  registerFirebaseInjectionTokens(firebase)
  await friendsDoc(userAUid).set({
    friends: {
      [userBUid]: { time: 123 }
    }
  })
  await friendsDoc(userBUid).set({
    friends: {
      [userAUid]: { time: 123 }
    }
  })
})

afterEach(async () => {
  await db.recursiveDelete(userDoc(userAUid))
  await db.recursiveDelete(userDoc(userBUid))
})

afterAll(async () => {
  await app.delete()
})

//#endregion

describe('valid friend removals', () => {
  test(`when user A removes user B as a friend, the relevant uid fields are deleted from the friends documents of user A and user B`, async () => {
    await removeFriend({ uid: userBUid })
    const userAFriends = (await friendsDoc(userAUid).get()).data()?.friends
    const userBFriends = (await friendsDoc(userBUid).get()).data()?.friends
    expect(userAFriends).toEqual({})
    expect(userBFriends).toEqual({})
  })
})

describe('expected failures', () => {
  it('fails if no "uid" argument is provided', async () => {
    let fails = false
    try { await removeFriend({}) }
    catch { fails = true }
    
    expect(fails).toEqual(true)
  })

  it('fails if the user is not authenticated', async () => {
    await signOut(firebase.auth)

    let fails = false
    try { await removeFriend({ uid: userBUid }) }
    catch { fails = true }

    expect(fails).toEqual(true)

    await signInDummyUser(authUserSeed)
  })
})