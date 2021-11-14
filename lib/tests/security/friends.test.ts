import { assertFails, assertSucceeds, RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { getDoc, setDoc, doc } from '@firebase/firestore'
import { createRulesTestEnvironment } from 'lib/tests/security/_setup'
import generateNoteId from '@/logic/utils/generateNoteId'

let authUid: string
let authenticatedDb: any
let testEnv: RulesTestEnvironment

beforeAll(async () => {
  let { } = { testEnv, authenticatedDb, authUid } = await createRulesTestEnvironment()
})

//? "activity docs" are defined as the habits doc, week docs, week icons docs and notes docs

test(`by default, authenticated users cannot get another user's activity docs`, async () => {
  const readHabits = () => getDoc(doc(authenticatedDb, `/users/not-my-uid/userData/habits`))
  const readWeek = () => getDoc(doc(authenticatedDb, `/users/not-my-uid/weeks/2021-11-01`))
  const readWeekIcons = () => getDoc(doc(authenticatedDb, `/users/not-my-uid/weekIcons/2021`))
  const readNotes = () => getDoc(doc(authenticatedDb, `/users/not-my-uid/notes/${generateNoteId()}`))
  expect(await assertFails(readHabits()))
  expect(await assertFails(readWeek()))
  expect(await assertFails(readWeekIcons()))
  expect(await assertFails(readNotes()))
})

test(`if user X has user Y registered as a friend, user Y can get user X's activity docs`, async () => {
  const userX = 'friends-rules-allow-test-uid'

  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'users', userX, 'userData', 'friends'), {
      friends: {
        [authUid]: { time: 123 }
      }
    })
  })
  const readWeek = () => getDoc(doc(authenticatedDb, `/users/${userX}/weeks/2021-11-01`))
  const readHabits = () => getDoc(doc(authenticatedDb, `/users/${userX}/userData/habits`))
  const readWeekIcons = () => getDoc(doc(authenticatedDb, `/users/${userX}/weekIcons/2021`))
  const readNotes = () => getDoc(doc(authenticatedDb, `/users/${userX}/notes/${generateNoteId()}`))
  expect(await assertSucceeds(readWeek()))
  expect(await assertSucceeds(readHabits()))
  expect(await assertSucceeds(readWeekIcons()))
  expect(await assertSucceeds(readNotes()))
})

test(`if user X has user Y registered as a friend, but not vice versa, user X can't get any of user Y's activity docs`, async () => {
  const userY = 'friends-rules-disallow-test-uid'

  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'users', authUid, 'userData', 'friends'), {
      friends: {
        [userY]: { time: 123 }
      }
    })
  })
  const readHabits = () => getDoc(doc(authenticatedDb, `/users/${userY}/userData/habits`))
  const readWeek = () => getDoc(doc(authenticatedDb, `/users/${userY}/weeks/2021-11-01`))
  const readWeekIcons = () => getDoc(doc(authenticatedDb, `/users/${userY}/weekIcons/2021`))
  const readNotes = () => getDoc(doc(authenticatedDb, `/users/${userY}/notes/${generateNoteId()}`))
  expect(await assertFails(readHabits()))
  expect(await assertFails(readWeek()))
  expect(await assertFails(readWeekIcons()))
  expect(await assertFails(readNotes()))
})