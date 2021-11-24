import { assertFails, assertSucceeds, RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { getDoc, setDoc, getDocs, query, where, doc, collection } from '@firebase/firestore'
import { createRulesTestEnvironment } from 'lib/tests/security/_setup'
import getFirebaseAdmin from '@/test-setup/getFirebaseAdmin'
import getDbShortcuts from '@/test-setup/getDbShortcuts'

const testProjectId = `test-habits-security${Date.now()}`
const { db: adminDb } = getFirebaseAdmin(testProjectId)
const { habitDoc } = getDbShortcuts(adminDb)

let authUid: string
let authenticatedDb: any
let testEnv: RulesTestEnvironment

beforeAll(async () => {
  let { } = { testEnv, authenticatedDb, authUid } = await createRulesTestEnvironment(testProjectId)
})

test(`by default, authenticated users cannot read another user's habits docs`, async () => {
  const uid = 'not-my-uid'
  await habitDoc(uid, 'abcdefgh').set({ visibility: 'public' })

  const getHabitDoc = () => getDoc(doc(authenticatedDb, 'users', uid, 'habits', 'abcdefgh'))
  const listPublicHabits = () => getDocs(query(collection(authenticatedDb, 'users', uid, 'habits'), where('visibility', '==', 'public')))
  expect(await assertFails(getHabitDoc()))
  expect(await assertFails(listPublicHabits()))

  await adminDb.recursiveDelete(adminDb.collection('users').doc('uid'))
})

test(`if user X has user Y registered as a friend, user Y can read user X's habits docs that are set to public, but not private ones`, async () => {
  const userX = 'friends-rules-allow-test-uid'

  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'users', userX, 'userData', 'friends'), {
      friends: {
        [authUid]: { time: 123 }
      }
    })
  })

  const listPublicHabits = () => getDocs(query(collection(authenticatedDb, 'users', userX, 'habits'), where('visibility', '==', 'public')))
  const listAllHabits = () => getDocs(query(collection(authenticatedDb, 'users', userX, 'habits')))

  expect(await assertSucceeds(listPublicHabits()))
  expect(await assertFails(listAllHabits()))
})

test(`if user X has user Y registered as a friend, but not vice versa, user X cannot read any of user Y's habits`, async () => {
  const userY = 'friends-rules-disallow-test-uid'

  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'users', authUid, 'userData', 'friends'), {
      friends: {
        [userY]: { time: 123 }
      }
    })
  })
  
  const listPublicHabits = () => getDocs(query(collection(authenticatedDb, 'users', userY, 'habits'), where('visibility', '==', 'public')))

  expect(await assertFails(listPublicHabits()))
})