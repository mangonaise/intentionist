import '@abraham/reflection'
import { container } from 'tsyringe'
import { when } from 'mobx'
import { setDoc, deleteDoc, doc } from '@firebase/firestore'
import { db } from '@/lib/firebase'
import signInDummyUser from '@/test-setup/signIn'
import AuthUser from '@/logic/app/AuthUser'
import DbHandler from '@/logic/app/DbHandler'
import ProfileHandler, { ProfileInfo } from '@/logic/app/ProfileHandler'
import InitialFetchHandler from '@/lib/logic/app/InitialFetchHandler'

// 🔨

let authUser: AuthUser, dbHandler: DbHandler, profileHandler: ProfileHandler

async function initializeProfileHandler() {
  const testContainer = container.createChildContainer()
  await (when(() => testContainer.resolve(InitialFetchHandler).hasCompletedInitialFetches))
  profileHandler = testContainer.resolve(ProfileHandler)
}

beforeAll(async () => {
  await signInDummyUser()
  authUser = container.resolve(AuthUser)
  dbHandler = container.resolve(DbHandler)
})

afterEach(async () => {
  await deleteDoc(doc(db, 'users', authUser.uid))
})

// 🧪

describe('initialization', () => {
  test('local profile is set to null when user profile does not exist in database', async () => {
    await initializeProfileHandler()
    expect(profileHandler.profileInfo).toBeNull()
  })

  test('fetching profile of an existing user works', async () => {
    const profile: ProfileInfo = { displayName: 'Bob' }
    await setDoc(doc(db, 'users', authUser.uid), { profile })
    await initializeProfileHandler()
    expect(profileHandler.profileInfo).toEqual(profile)
  })
})

describe('behavior', () => {
  beforeEach(async () => {
    await initializeProfileHandler()
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

  test('updated profile data will be reflected in local cache', async () => {
    await profileHandler.updateUserProfile({
      displayName: 'Zoe'
    })
    expect(profileHandler.profileInfo?.displayName).toBe('Zoe')
  })
})

test('teardown: user document is removed after tests', async () => {
  expect(await dbHandler.getUserDoc()).toBeUndefined()
})