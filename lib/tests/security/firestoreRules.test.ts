import { RulesTestEnvironment, RulesTestContext, assertFails, assertSucceeds } from '@firebase/rules-unit-testing'
import { setDoc, getDoc, doc } from '@firebase/firestore'
import { createRulesTestEnvironment } from './_setup'

const authUid = 'test-uid'
let testEnv: RulesTestEnvironment, unauthenticatedContext: RulesTestContext, authenticatedContext: RulesTestContext
let unauthenticatedDb: any, authenticatedDb: any

beforeAll(async () => {
  testEnv = await createRulesTestEnvironment()
  unauthenticatedContext = testEnv.unauthenticatedContext()
  unauthenticatedDb = unauthenticatedContext.firestore()
  authenticatedContext = testEnv.authenticatedContext(authUid)
  authenticatedDb = authenticatedContext.firestore()
})

afterAll(async () => {
  await testEnv.clearFirestore()
  await testEnv.cleanup()
})

test('unauthenticated users cannot read documents', async () => {
  const read = getDoc(doc(unauthenticatedDb, '/users/bob'))
  expect(await assertFails(read))
})

test('unauthenticated users cannot write to the database', async () => {
  const write = setDoc(doc(unauthenticatedDb, '/users/bob'), {
    profile: { displayName: 'hacker' }
  })
  expect(await assertFails(write))
})

test(`by default, authenticated users cannot read another user's document`, async () => {
  const read = getDoc(doc(authenticatedDb, '/users/alice'))
  expect(await assertFails(read))
})

test(`by default, authenticated users cannot write to another user's document`, async () => {
  const write = setDoc(doc(authenticatedDb, '/users/alice'), {
    profile: { displayName: 'not alice' }
  })
  expect(await assertFails(write))
})

test('authenticated users can read their own documents', async () => {
  const read = getDoc(doc(authenticatedDb, `/users/${authUid}`))
  expect(await assertSucceeds(read))
})

test('authenticated users can write to their own documents', async () => {
  const write = setDoc(doc(authenticatedDb, `/users/${authUid}`), {
    profile: { displayName: 'legit user' }
  })
  expect(await assertSucceeds(write))
})