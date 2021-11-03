import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing'
import { setDoc, getDoc, getDocs, doc, collection, query } from '@firebase/firestore'
import { createRulesTestEnvironment } from './_setup'

let authUid: string
let unauthenticatedDb: any, authenticatedDb: any

beforeAll(async () => {
  let { } = { unauthenticatedDb, authenticatedDb, authUid } = await createRulesTestEnvironment()
})

test('users cannot write documents in the usernames collection', async () => {
  const create = setDoc(doc(authenticatedDb, 'usernames', 'my_username'), { uid: authUid })
  expect(await assertFails(create))
})

test('unauthenticated users cannot get documents from the usernames collection', async () => {
  const get = getDoc(doc(unauthenticatedDb, 'usernames', 'some_username'))
  expect(await assertFails(get))
})

test('authenticated users can get individual documents in the username collection', async () => {
  const get = getDoc(doc(authenticatedDb, 'usernames', 'some_username'))
  expect(await assertSucceeds(get))
})

test('users cannot create a query which might return username documents', async () => {
  const list = getDocs(query(collection(authenticatedDb, 'usernames')))
  expect(await assertFails(list))
})