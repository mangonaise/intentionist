import { setDoc, deleteDoc, doc } from '@firebase/firestore'
import { db } from '../firebase'
import authHandler from '../logic/app/authHandler'
import dbHandler from '../logic/app/dbHandler'
import profileHandler from '../logic/app/profileHandler'
import signInDummyUser from './_setup/signIn'

beforeAll(async () => {
  await signInDummyUser()
})

afterEach(async () => {
  await deleteDoc(doc(db, 'users', authHandler.user!.uid))
  profileHandler().profileInfo = undefined
})

test('user profile is undefined before fetching', async () => {
  expect(profileHandler().profileInfo).toBeUndefined()
})

test('attempting to fetch non-existent profile will set local profile info to null', async () => {
  await profileHandler().fetchUserProfile()
  expect(profileHandler().profileInfo).toBeNull()
})

test('fetching profile of an existing user works', async () => {
  const profile = { displayName: 'Bob' }
  await setDoc(dbHandler().userDocRef(''), { profile })
  await profileHandler().fetchUserProfile()
  expect(profileHandler().profileInfo).toEqual(profile)
})

test('updated profile info will appear in the "profile" field in the user document', async () => {
  await profileHandler().updateUserProfile({
    displayName: 'Jeff'
  })
  const userDoc = await dbHandler().getUserDoc()
  expect(userDoc).toEqual({
    profile: {
      displayName: 'Jeff'
    }
  })
})

test('updated profile data will be reflected in local profile info object', async () => {
  await profileHandler().updateUserProfile({
    displayName: 'Zoe'
  })
  expect(profileHandler().profileInfo?.displayName).toBe('Zoe')
})

test('teardown: user data is removed after tests', async () => {
  expect(profileHandler().profileInfo).toBeUndefined()
  const userDoc = await dbHandler().getUserDoc()
  expect(userDoc).toBeUndefined()
})