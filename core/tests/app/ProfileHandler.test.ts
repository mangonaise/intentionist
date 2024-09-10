import '@abraham/reflection'
import { container } from 'tsyringe'
import { setDoc, doc } from '@firebase/firestore'
import initializeFirebase, { registerFirebaseInjectionTokens } from '@/firebase-setup/initializeFirebase'
import signInDummyUser from '@/test-setup/signInDummyUser'
import getFirebaseAdmin from '@/test-setup/getFirebaseAdmin'
import simulateInitialFetches from '@/test-setup/simulateInitialFetches'
import teardownFirebase from '@/test-setup/teardownFirebase'
import ProfileHandler, { UserProfileInfo } from '@/logic/app/ProfileHandler'
import AuthUser from '@/logic/app/AuthUser'
import DbHandler from '@/logic/app/DbHandler'

//#region test setup

const firebase = initializeFirebase('test-profilehandler')
const { app: firebaseAdmin, db: adminDb } = getFirebaseAdmin('test-profilehandler')

let authUser: AuthUser, dbHandler: DbHandler, profileHandler: ProfileHandler
let testUsername = 'profile_handler_test_username'

async function initializeProfileHandler() {
  await simulateInitialFetches()
  profileHandler = container.resolve(ProfileHandler)
}

beforeAll(async () => {
  await signInDummyUser()
})

beforeEach(() => {
  registerFirebaseInjectionTokens(firebase)
  authUser = container.resolve(AuthUser)
  dbHandler = container.resolve(DbHandler)
})

afterEach(async () => {
  await adminDb.collection('users').doc(authUser.uid).delete()
  await adminDb.collection('usernames').doc(testUsername).delete()
  container.clearInstances()
})

afterAll(async () => {
  await teardownFirebase(firebase)
  await firebaseAdmin.delete()
})

//#endregion

describe('initialization', () => {
  test(`if a user's profile does not exist in the database, the local profile info is set to null`, async () => {
    await initializeProfileHandler()
    expect(profileHandler.profileInfo).toBeNull()
  })

  test(`if a user's profile does exist in the database, their profile will be correctly fetched`, async () => {
    // add user profile to db
    const profile: UserProfileInfo = { displayName: 'Bob', avatar: '😎', username: testUsername }
    await setDoc(doc(firebase.db, 'users', authUser.uid), profile)

    // initialize to fetch
    await initializeProfileHandler()
    expect(profileHandler.profileInfo).toEqual(profile)
  })
})

describe('behavior', () => {
  beforeEach(async () => {
    await initializeProfileHandler()
  })

  test(`when a user updates their profile, the local cache is correctly updated`, async () => {
    const testProfileInfo = {
      displayName: 'Zoe',
      avatar: '🐸',
      username: testUsername
    }
    await profileHandler.setUserProfileInfo(testProfileInfo)
    expect(profileHandler.profileInfo).toEqual(testProfileInfo)
  })

  test(`when a user updates their profile, the "profile" field in the user document is correctly updated`, async () => {
    const testProfileInfo: UserProfileInfo = {
      displayName: 'Jeff',
      avatar: '🐹',
      username: testUsername
    }
    await profileHandler.setUserProfileInfo(testProfileInfo)

    const userDoc = await dbHandler.getDocData(dbHandler.userDocRef())
    expect(userDoc).toEqual(testProfileInfo)
  })
})