import { RulesTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing'
import { setDoc, getDoc, getDocs, doc, collection, query, where } from '@firebase/firestore'
import { createRulesTestEnvironment } from './_setup'

//#region test setup

let authUid: string
let testEnv: RulesTestEnvironment
let unauthenticatedDb: any, authenticatedDb: any

beforeAll(async () => {
  let { } = { testEnv, unauthenticatedDb, authenticatedDb, authUid } = await createRulesTestEnvironment()
})

afterAll(async () => {
  await testEnv.clearFirestore()
  await testEnv.cleanup()
})

//#endregion

test('unauthenticated users cannot read from the database', async () => {
  const get = () => getDoc(doc(unauthenticatedDb, '/users/bob'))
  expect(await assertFails(get()))
})

test('unauthenticated users cannot write to the database', async () => {
  const create = () => setDoc(doc(unauthenticatedDb, '/users/bob'), {
    profile: { displayName: 'hacker', avatar: '🤖', username: 'hackr123' }
  })
  expect(await assertFails(create()))
})

test(`authenticated users cannot get another user's profile document`, async () => {
  const get = () => getDoc(doc(authenticatedDb, '/users/alice'))
  expect(await assertFails(get()))
})

test(`authenticated users cannot create a query that might return user documents`, async () => {
  const list = () => getDocs(query(collection(authenticatedDb, 'users'), where('avatar', '==', '😎')))
  expect(await assertFails(list()))
})

test(`authenticated users cannot write to another user's profile document`, async () => {
  const write = () => setDoc(doc(authenticatedDb, '/users/alice'), {
    profile: { displayName: 'not alice', avatar: '🤖', username: 'hackr123' }
  })
  expect(await assertFails(write()))
})

test('authenticated users can create their own profile document', async () => {
  const create = () => setDoc(doc(authenticatedDb, `/users/${authUid}`), {
    displayName: 'legit user', avatar: '😎', username: 'legit_username'
  })
  expect(await assertSucceeds(create()))
})

test('authenticated users can update their own profile document once created', async () => {
  await setDoc(doc(authenticatedDb, `/users/${authUid}`), {
    displayName: 'old name', avatar: '👴', username: 'old_username'
  })
  const update = () => setDoc(doc(authenticatedDb, `/users/${authUid}`), {
    displayName: 'new name', avatar: '😎', username: 'new_username'
  })
  expect(await assertSucceeds(update()))
})