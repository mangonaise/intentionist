import '@abraham/reflection'
import { setDoc, deleteDoc, doc } from '@firebase/firestore'
import { container } from 'tsyringe'
import { db } from '../../firebase'
import AuthUser from '../../logic/app/AuthUser'
import DbHandler from '../../logic/app/DbHandler'
import ProfileHandler from '../../logic/app/ProfileHandler'
import signInDummyUser from '../_setup/signIn'

// 🔨

let authUser: AuthUser, profileHandler: ProfileHandler, dbHandler: DbHandler

beforeAll(async () => {
  await signInDummyUser()
  authUser = container.resolve(AuthUser)
  dbHandler = container.resolve(DbHandler)
  profileHandler = container.resolve(ProfileHandler)
})

afterEach(async () => {
  await deleteDoc(doc(db, 'users', authUser.uid))
  profileHandler.profileInfo = undefined
})

// 🧪

test('user profile is undefined before fetching', async () => {
  expect(profileHandler.profileInfo).toBeUndefined()
})

test('attempting to fetch non-existent profile will set local profile info to null', async () => {
  await profileHandler.fetchUserProfile()
  expect(profileHandler.profileInfo).toBeNull()
})

test('attempting to fetch profile twice will instead return existing profile', async () => {
  expect(await profileHandler.fetchUserProfile()).toBeUndefined()
  expect(await profileHandler.fetchUserProfile()).not.toBeUndefined()
})

test('fetching profile of an existing user works', async () => {
  const profile = { displayName: 'Bob' }
  await setDoc(dbHandler.userDocRef(''), { profile })
  await profileHandler.fetchUserProfile()
  expect(profileHandler.profileInfo).toEqual(profile)
})

test('updated profile info will appear in the "profile" field in the user document', async () => {
  await profileHandler.updateUserProfile({
    displayName: 'Jeff'
  })
  const userDoc = await dbHandler.getUserDoc()
  expect(userDoc).toEqual({
    profile: {
      displayName: 'Jeff'
    }
  })
})

test('updated profile data will be reflected in local profile info object', async () => {
  await profileHandler.updateUserProfile({
    displayName: 'Zoe'
  })
  expect(profileHandler.profileInfo?.displayName).toBe('Zoe')
})

test('teardown: user data is removed after tests', async () => {
  expect(profileHandler.profileInfo).toBeUndefined()
  const userDoc = await dbHandler.getUserDoc()
  expect(userDoc).toBeUndefined()
})