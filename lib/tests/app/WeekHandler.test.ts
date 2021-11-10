import '@abraham/reflection'
import { container } from 'tsyringe'
import { collection, doc, getDoc, getDocs, query } from '@firebase/firestore'
import { when } from 'mobx'
import { formatFirstDayOfThisWeek, formatYYYYMMDD, getFirstDayOfThisWeek } from '@/logic/utils/dateUtilities'
import { addWeeks, isMonday } from 'date-fns'
import initializeFirebase, { registerFirebaseInjectionTokens } from '@/firebase-setup/initializeFirebase'
import WeekHandler, { NoteMetadata, WeekDocumentData } from '@/logic/app/WeekHandler'
import AuthUser from '@/logic/app/AuthUser'
import DbHandler from '@/logic/app/DbHandler'
import HabitsHandler, { Habit } from '@/logic/app/HabitsHandler'
import generateHabitId from '@/logic/utils/generateHabitId'
import generateNoteId from '@/logic/utils/generateNoteId'
import signInDummyUser from '@/test-setup/signInDummyUser'
import deleteHabitsDoc from '@/test-setup/deleteHabitsDoc'
import deleteWeeks from '@/test-setup/deleteWeeks'
import getFirebaseAdmin from '@/test-setup/getFirebaseAdmin'
import teardownFirebase from '@/test-setup/teardownFirebase'
import simulateInitialFetches from '@/test-setup/simulateInitialFetches'

// 🔨

const projectId = 'test-weekhandler'
const firebase = initializeFirebase(projectId)
const { db: adminDb } = getFirebaseAdmin(projectId)


let weekHandler: WeekHandler, dbHandler: DbHandler, authUser: AuthUser, habitsHandler: HabitsHandler

const dummyTrackerStatuses: WeekDocumentData['statuses'] = {
  [generateHabitId()]: { 0: ['⭐'], 3: ['👍'] },
  [generateHabitId()]: { 2: ['✨'], 6: ['🤏'] },
  [generateHabitId()]: { 1: ['😄'], 4: ['👎'], 5: ['👌'] },
}

const dummyNoteDataA = {
  habitId: generateHabitId(),
  noteId: generateNoteId(),
  metadata: {
    icon: '📖',
    title: 'A test note'
  } as NoteMetadata
}
const dummyNoteDataB = {
  habitId: generateHabitId(),
  noteId: generateNoteId(),
  metadata: {
    icon: '🧪',
    title: 'A note about writing tests'
  } as NoteMetadata
}

async function initializeWeekHandler() {
  await simulateInitialFetches()
  habitsHandler = container.resolve(HabitsHandler)
  weekHandler = container.resolve(WeekHandler)
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
  await deleteWeeks(adminDb)
  await deleteHabitsDoc(adminDb)
  container.clearInstances()
})

afterAll(async () => {
  await teardownFirebase(firebase)
})

// 🧪

describe('initialization', () => {
  test('if no weeks exist in database, set week in view to an empty week starting on this Monday', async () => {
    await initializeWeekHandler()
    expect(isMonday(new Date(weekHandler.weekInView.startDate))).toEqual(true)
    expect(weekHandler.weekInView.startDate).toEqual(formatFirstDayOfThisWeek())
    expect(weekHandler.weekInView.statuses).toBeUndefined()
  })

  test('if some weeks already exist in the database, initialize with the most recent one', async () => {
    const olderWeek = '2021-09-27', newerWeek = '2021-10-04'
    await dbHandler.updateWeekDoc(olderWeek, {})
    await dbHandler.updateWeekDoc(newerWeek, {})
    await initializeWeekHandler()
    expect(weekHandler.weekInView.startDate).toEqual(newerWeek)
  })

  test(`tracker statuses are correctly placed into week in view's local cache`, async () => {
    await dbHandler.updateWeekDoc('2021-09-20', { startDate: '2021-09-20', statuses: dummyTrackerStatuses })
    await initializeWeekHandler()
    expect(weekHandler.weekInView.statuses).toEqual(dummyTrackerStatuses)
  })

  test(`note IDs and metadata are correctly placed into week in view's local cache`, async () => {
    await dbHandler.updateWeekDoc('2021-10-11', {
      notes: {
        [dummyNoteDataA.habitId]: [dummyNoteDataA.noteId],
        [dummyNoteDataB.habitId]: [dummyNoteDataB.noteId]
      },
      notesMetadata: {
        [dummyNoteDataA.noteId]: dummyNoteDataA.metadata,
        [dummyNoteDataB.noteId]: dummyNoteDataB.metadata
      }
    })
    await initializeWeekHandler()
    expect(weekHandler.weekInView.notes).toEqual({
      [dummyNoteDataA.habitId]: [dummyNoteDataA.noteId],
      [dummyNoteDataB.habitId]: [dummyNoteDataB.noteId]
    })
    expect(weekHandler.weekInView.notesMetadata).toEqual({
      [dummyNoteDataA.noteId]: dummyNoteDataA.metadata,
      [dummyNoteDataB.noteId]: dummyNoteDataB.metadata
    })
  })

  test(`focused times are correctly placed into week in view's local cache`, async () => {
    const habitIdA = generateHabitId()
    const habitIdB = generateHabitId()
    await dbHandler.updateWeekDoc('2021-10-18', {
      times: {
        [habitIdA]: { 0: 1500, 3: 6000 },
        [habitIdB]: { 1: 600, 6: 4500 }
      }
    })
    await initializeWeekHandler()
    expect(weekHandler.weekInView.times).toEqual({
      [habitIdA]: { 0: 1500, 3: 6000 },
      [habitIdB]: { 1: 600, 6: 4500 }
    })
  })

  test(`week icon is correctly placed into week in view's local cache`, async () => {
    await dbHandler.updateWeekDoc('2021-10-25', {
      icon: '⭐'
    })
    await initializeWeekHandler()
    expect(weekHandler.weekInView.icon).toEqual('⭐')
  })
})

describe('updating tracker statuses', () => {
  beforeEach(async () => {
    await initializeWeekHandler()
  })

  test('setting any data on an empty week will automatically add the start date to the document', async () => {
    const weekStartDate = formatFirstDayOfThisWeek()
    await weekHandler.setTrackerStatus(generateHabitId(), 0, ['🌱'])
    const weekDoc = await dbHandler.getWeekDoc(weekStartDate)
    expect(weekDoc?.startDate).toEqual(weekStartDate)
  })

  test('setting tracker statuses updates local cache and database correctly', async () => {
    const habitIdA = generateHabitId(), habitIdB = generateHabitId()
    await weekHandler.setTrackerStatus(habitIdA, 1, ['😎'])
    await weekHandler.setTrackerStatus(habitIdB, 4, ['🤔'])
    const expectedStatuses = {
      [habitIdA]: { 1: ['😎'] },
      [habitIdB]: { 4: ['🤔'] }
    }
    const weekDoc = await dbHandler.getWeekDoc(formatFirstDayOfThisWeek())
    expect(weekHandler.weekInView.statuses).toEqual(expectedStatuses)
    expect(weekDoc?.statuses).toEqual(expectedStatuses)
  })

  test('updating a tracker status returns the new status', async () => {
    const habitId = generateHabitId()
    expect(await weekHandler.setTrackerStatus(habitId, 1, ['👋'])).toEqual(['👋'])
  })

  test('attempting to update a tracker status without changing anything just returns the existing status', async () => {
    const habitId = generateHabitId()
    const firstUpdate = await weekHandler.setTrackerStatus(habitId, 1, ['😎'])
    const secondUpdate = await weekHandler.setTrackerStatus(habitId, 1, ['😎'])
    expect(firstUpdate === secondUpdate).toEqual(true)
  })

  test('similarly, updating an non-existent tracker status with an empty status returns the existing (undefined) value', async () => {
    const update = await weekHandler.setTrackerStatus(generateHabitId(), 5, [])
    expect(update).toBeUndefined()
  })

  test('clearing all tracker statuses for a given habit removes the habit field entirely, locally and in database', async () => {
    const habitId = generateHabitId()
    await weekHandler.setTrackerStatus(habitId, 0, ['🗑️'])
    await weekHandler.setTrackerStatus(habitId, 1, ['🗑️'])

    await weekHandler.setTrackerStatus(habitId, 0, [])
    await weekHandler.setTrackerStatus(habitId, 1, [])

    const weekDoc = await dbHandler.getWeekDoc(formatFirstDayOfThisWeek())
    expect(weekHandler.weekInView.statuses?.[habitId]).toBeUndefined()
    expect(weekDoc?.statuses?.[habitId]).toBeUndefined()
  })

  test('clearing a tracker status removes the habit\'s corresponding weekday id field, locally and in database', async () => {
    const habitId = generateHabitId()
    await weekHandler.setTrackerStatus(habitId, 0, ['😃'])
    await weekHandler.setTrackerStatus(habitId, 1, ['🗑️'])

    await weekHandler.setTrackerStatus(habitId, 1, [])

    const weekDoc = await dbHandler.getWeekDoc(formatFirstDayOfThisWeek())
    expect(weekHandler.weekInView.statuses?.[habitId][1]).toBeUndefined()
    expect(weekDoc?.statuses?.[habitId][1]).toBeUndefined()
  })
})

describe('updating local note metadata', () => {
  beforeEach(async () => {
    await initializeWeekHandler()
  })

  test('setting notes correctly updates the local cache', () => {
    weekHandler.setNoteLocally(dummyNoteDataA.habitId, dummyNoteDataA.noteId, dummyNoteDataA.metadata)
    weekHandler.setNoteLocally(dummyNoteDataB.habitId, dummyNoteDataB.noteId, dummyNoteDataB.metadata)
    expect(weekHandler.weekInView.notes).toEqual({
      [dummyNoteDataA.habitId]: [dummyNoteDataA.noteId],
      [dummyNoteDataB.habitId]: [dummyNoteDataB.noteId],
    })
    expect(weekHandler.weekInView.notesMetadata).toEqual({
      [dummyNoteDataA.noteId]: dummyNoteDataA.metadata,
      [dummyNoteDataB.noteId]: dummyNoteDataB.metadata
    })
  })

  test('updating an existing note correctly updates the local cache and does not create a duplicate', () => {
    weekHandler.setNoteLocally(dummyNoteDataA.habitId, dummyNoteDataA.noteId, dummyNoteDataA.metadata)
    weekHandler.setNoteLocally(dummyNoteDataA.habitId, dummyNoteDataA.noteId, {
      ...dummyNoteDataA.metadata,
      icon: '🥳'
    })
    expect(weekHandler.weekInView.notes).toEqual({
      [dummyNoteDataA.habitId]: [dummyNoteDataA.noteId],
    })
    expect(weekHandler.weekInView.notesMetadata).toEqual({
      [dummyNoteDataA.noteId]: { ...dummyNoteDataA.metadata, icon: '🥳' },
    })
  })

  test('clearing notes correctly updates the local cache', () => {
    weekHandler.setNoteLocally(dummyNoteDataA.habitId, dummyNoteDataA.noteId, dummyNoteDataA.metadata)
    weekHandler.setNoteLocally(dummyNoteDataB.habitId, dummyNoteDataB.noteId, dummyNoteDataB.metadata)
    weekHandler.clearNoteLocally(dummyNoteDataA.habitId, dummyNoteDataA.noteId)
    expect(weekHandler.weekInView.notes).toEqual({
      [dummyNoteDataB.habitId]: [dummyNoteDataB.noteId]
    })
    expect(weekHandler.weekInView.notesMetadata).toEqual({
      [dummyNoteDataB.noteId]: dummyNoteDataB.metadata
    })
  })
})

describe('updating focused times', () => {
  beforeEach(async () => {
    await initializeWeekHandler()
  })

  test('setting focused time updates the local cache and database correctly', async () => {
    await weekHandler.viewWeek('2021-10-04')
    const habitId = generateHabitId()

    await weekHandler.setFocusedTime(habitId, 2, 5000)
    await weekHandler.setFocusedTime(habitId, 4, 10000)

    expect(weekHandler.weekInView.times?.[habitId]).toEqual({
      2: 5000,
      4: 10000
    })

    const weekDoc = await dbHandler.getWeekDoc('2021-10-04')
    expect(weekDoc?.times).toEqual({
      [habitId]: {
        2: 5000,
        4: 10000
      }
    })
  })

  test('adding focused time correctly updates the local cache and database correctly', async () => {
    await weekHandler.viewWeek('2021-10-04')
    const habitId = generateHabitId()

    await weekHandler.addFocusedTime(habitId, 3, 400)
    await weekHandler.addFocusedTime(habitId, 3, 600)

    expect(weekHandler.weekInView.times?.[habitId]).toEqual({ 3: 1000 })

    const weekDoc = await dbHandler.getWeekDoc('2021-10-04')
    expect(weekDoc?.times).toEqual({ [habitId]: { 3: 1000 } })
  })
})

describe('switching weeks', () => {
  const dummyWeekData: Partial<WeekDocumentData> = {
    statuses: dummyTrackerStatuses,
    notes: { abcdefgh: [dummyNoteDataA.noteId] },
    notesMetadata: { [dummyNoteDataA.noteId]: dummyNoteDataA.metadata }
  }

  beforeEach(async () => {
    await initializeWeekHandler()
  })

  test('switching to a non-existent week in the past will generate an empty week locally but does not create a document in the database', async () => {
    await weekHandler.viewWeek('2021-09-27')
    const { startDate, statuses } = weekHandler.weekInView
    expect(startDate).toEqual('2021-09-27')
    expect(statuses).toBeUndefined()
    expect((await getDoc(doc(firebase.db, 'users', authUser.uid, 'weeks', '2021-09-27'))).data()).toBeUndefined()
  })

  test('switching to the new latest week will generate an empty week locally and also create a document in the database', async () => {
    const newWeekStartDate = formatYYYYMMDD(addWeeks(getFirstDayOfThisWeek(), 1))
    await weekHandler.viewWeek(newWeekStartDate)
    const { startDate, statuses } = weekHandler.weekInView
    expect(startDate).toEqual(newWeekStartDate)
    expect(statuses).toBeUndefined()
    expect(await dbHandler.getWeekDoc(newWeekStartDate)).toEqual({
      startDate: newWeekStartDate
    })
  })

  test('switching to a week that exists in database will load that week data', async () => {
    await dbHandler.updateWeekDoc('2021-09-20', dummyWeekData)
    await weekHandler.viewWeek('2021-09-20')
    expect(weekHandler.weekInView).toEqual({
      startDate: '2021-09-20',
      statuses: dummyTrackerStatuses,
      notes: dummyWeekData.notes,
      notesMetadata: dummyWeekData.notesMetadata
    })
  })

  test(`switching weeks will immediately change week in view's start date, but will clear local data until loading is complete`, async () => {
    await dbHandler.updateWeekDoc('2021-09-20', dummyWeekData)
    await dbHandler.updateWeekDoc('2021-09-27', { statuses: dummyTrackerStatuses })
    await weekHandler.viewWeek('2021-09-20')
    weekHandler.viewWeek('2021-09-27')
    expect(weekHandler.weekInView).toEqual({ startDate: '2021-09-27' })
    await when(() => !weekHandler.isLoadingWeek)
    expect(weekHandler.weekInView.statuses).toEqual(dummyTrackerStatuses)
  })

  test('attempting to switch to the same week will not load the week again', async () => {
    await weekHandler.viewWeek('2021-10-04')
    weekHandler.viewWeek('2021-10-04')
    expect(weekHandler.isLoadingWeek).toEqual(false)
  })
})

describe('representation of latest week', () => {
  test(`if no weeks exist in database, latest week is this week's start date`, async () => {
    await initializeWeekHandler()
    expect(weekHandler.latestWeekStartDate).toEqual(formatFirstDayOfThisWeek())
  })

  test('if some weeks exist in database, latest week is the start date of the most recent one', async () => {
    const olderWeek = '2021-09-27', newerWeek = '2021-10-04'
    await dbHandler.updateWeekDoc(olderWeek, {})
    await dbHandler.updateWeekDoc(newerWeek, {})
    await initializeWeekHandler()
    expect(weekHandler.latestWeekStartDate).toEqual((await dbHandler.getWeekDoc(newerWeek))?.startDate)
  })

  test('after generating an empty week, set latest week to the new week\'s start date only if it is greater than the previous value', async () => {
    await initializeWeekHandler()
    const nextWeek = formatYYYYMMDD(addWeeks(getFirstDayOfThisWeek(), 1))
    await weekHandler.viewWeek(nextWeek)
    expect(weekHandler.latestWeekStartDate).toEqual(nextWeek)
    await weekHandler.viewWeek(formatFirstDayOfThisWeek())
    expect(weekHandler.latestWeekStartDate).toEqual(nextWeek)
  })
})

describe('displaying correct habits', () => {
  let activeHabit: Habit, suspendedHabit: Habit, archivedHabitA: Habit, archivedHabitB: Habit

  beforeAll(() => {
    activeHabit = { id: generateHabitId(), icon: '🏃‍♂️', name: 'WeekHandler test active', status: 'active', timeable: true }
    suspendedHabit = { id: generateHabitId(), icon: '⏸', name: 'WeekHandler test suspended', status: 'suspended' }
    archivedHabitA = { id: generateHabitId(), icon: '🗑️', name: 'WeekHandler test archived A', status: 'archived' }
    archivedHabitB = { id: generateHabitId(), icon: '👴', name: 'WeekHandler test archived B', status: 'archived' }
  })

  beforeEach(async () => {
    await initializeWeekHandler()
    await habitsHandler.setHabit(activeHabit)
    await habitsHandler.setHabit(suspendedHabit)
    await habitsHandler.setHabit(archivedHabitA)
    await habitsHandler.setHabit(archivedHabitB)
    weekHandler.refreshHabitsInView()
  })

  test('on startup, the view is not condensed and the condenser toggle is not shown', () => {
    expect(weekHandler.condenseView).toEqual(false)
    expect(weekHandler.showCondenseViewToggle).toEqual(false)
  })

  test('when a previous week with no data is viewed and user has active habits, view is condensed by default, condenser toggle is shown, and no habits are shown', async () => {
    await weekHandler.viewWeek('2021-09-27')
    expect(weekHandler.condenseView).toEqual(true)
    expect(weekHandler.showCondenseViewToggle).toEqual(true)
    expect(weekHandler.habitsInView).toEqual([])
  })

  test('when viewing a previous week with no data and user has no active habits, condensed view is disabled and the condenser toggle is not shown', async () => {
    await habitsHandler.deleteHabitById(activeHabit.id)
    await weekHandler.viewWeek('2021-09-27')
    expect(weekHandler.condenseView).toEqual(false)
    expect(weekHandler.showCondenseViewToggle).toEqual(false)
  })

  test('after switching back to the latest week, condensed view is disabled and the condenser toggle is hidden', async () => {
    await weekHandler.viewWeek('2021-09-27')
    await weekHandler.viewWeek(formatFirstDayOfThisWeek())
    expect(weekHandler.condenseView).toEqual(false)
    expect(weekHandler.showCondenseViewToggle).toEqual(false)
  })

  test('after generating the new latest week, condensed view is disabled and the condenser toggle is hidden', async () => {
    await weekHandler.viewWeek(formatYYYYMMDD(addWeeks(getFirstDayOfThisWeek(), 1)))
    expect(weekHandler.condenseView).toEqual(false)
    expect(weekHandler.showCondenseViewToggle).toEqual(false)
  })

  test('when viewing previous weeks with no data, if condensed view is disabled, only active habits are shown', async () => {
    await weekHandler.viewWeek('2021-09-27')
    weekHandler.setCondensedView(false)
    expect(weekHandler.habitsInView).toEqual([activeHabit])
  })

  test('when viewing latest week with no data, only active habits are shown', () => {
    weekHandler.setViewMode('tracker')
    expect(weekHandler.habitsInView).toEqual([activeHabit])
    weekHandler.setViewMode('notes')
    expect(weekHandler.habitsInView).toEqual([activeHabit])
    weekHandler.setViewMode('focus')
    expect(weekHandler.habitsInView).toEqual([activeHabit])
  })

  describe('when view mode is habit tracker', () => {
    beforeEach(() => weekHandler.setViewMode('tracker'))

    test('when viewing latest week, all active habits, plus any habits with tracker data, are shown', async () => {
      await weekHandler.setTrackerStatus(suspendedHabit.id, 1, ['👍'])
      await weekHandler.setTrackerStatus(archivedHabitA.id, 5, ['👍'])
      expect(weekHandler.habitsInView).toEqual([activeHabit, suspendedHabit, archivedHabitA])
    })

    test('when viewing previous weeks with tracker data, only habits with tracker data are shown by default', async () => {
      await weekHandler.viewWeek('2021-09-27')
      await weekHandler.setTrackerStatus(archivedHabitB.id, 3, ['👍'])
      expect(weekHandler.habitsInView).toEqual([archivedHabitB])
    })

    test('when viewing previous weeks with tracker data, if condensed view is disabled, show habits with tracker data and all active habits', async () => {
      await weekHandler.viewWeek('2021-09-27')
      await weekHandler.setTrackerStatus(suspendedHabit.id, 6, ['👍'])
      weekHandler.setCondensedView(false)
      expect(weekHandler.habitsInView).toEqual([activeHabit, suspendedHabit])
    })

    test('when viewing previous weeks, if all active habits have tracker data, the condenser toggle is not shown', async () => {
      await weekHandler.viewWeek('2021-08-30')
      await weekHandler.setTrackerStatus(activeHabit.id, 5, ['😎'])
      await weekHandler.viewWeek(formatFirstDayOfThisWeek())
      await weekHandler.viewWeek('2021-08-30')
      expect(weekHandler.showCondenseViewToggle).toEqual(false)

      await weekHandler.setTrackerStatus(activeHabit.id, 5, [])
      expect(weekHandler.showCondenseViewToggle).toEqual(true)
    })

    test('after clearing tracker data for archived or suspended habits, that habit is removed from view', async () => {
      await weekHandler.setTrackerStatus(suspendedHabit.id, 3, ['🙃'])
      await weekHandler.setTrackerStatus(archivedHabitA.id, 6, ['🙃'])
      await weekHandler.setTrackerStatus(suspendedHabit.id, 3, [])
      await weekHandler.setTrackerStatus(archivedHabitA.id, 6, [])
      expect(weekHandler.habitsInView).toEqual([activeHabit])
    })
  })

  describe('when view mode is notes', () => {
    beforeEach(() => weekHandler.setViewMode('notes'))

    test('when viewing latest week, all active habits, plus any habits with notes data, are shown', () => {
      weekHandler.setNoteLocally(suspendedHabit.id, dummyNoteDataA.noteId, dummyNoteDataA.metadata)
      weekHandler.setNoteLocally(archivedHabitA.id, dummyNoteDataB.noteId, dummyNoteDataB.metadata)
      weekHandler.refreshHabitsInView()
      expect(weekHandler.habitsInView).toEqual([activeHabit, suspendedHabit, archivedHabitA])
    })

    test('when viewing previous weeks with notes data, only habits with notes data are shown by default', async () => {
      await weekHandler.viewWeek('2021-09-27')
      weekHandler.setNoteLocally(archivedHabitB.id, dummyNoteDataB.noteId, dummyNoteDataB.metadata)
      weekHandler.refreshHabitsInView()
      expect(weekHandler.habitsInView).toEqual([archivedHabitB])
    })

    test('when viewing previous weeks with notes data, if condensed view is disabled, show habits with notes data and all active habits', async () => {
      await weekHandler.viewWeek('2021-09-27')
      weekHandler.setNoteLocally(suspendedHabit.id, dummyNoteDataA.noteId, dummyNoteDataA.metadata)
      weekHandler.setCondensedView(false)
      expect(weekHandler.habitsInView).toEqual([activeHabit, suspendedHabit])
    })

    test('when viewing previous weeks, if all active habits have notes data, the condenser toggle is not shown', async () => {
      await weekHandler.viewWeek('2021-08-30')
      weekHandler.setNoteLocally(activeHabit.id, dummyNoteDataA.noteId, dummyNoteDataA.metadata)
      weekHandler.refreshHabitsInView()
      expect(weekHandler.showCondenseViewToggle).toEqual(false)
      weekHandler.clearNoteLocally(activeHabit.id, dummyNoteDataA.noteId)
      weekHandler.refreshHabitsInView()
      expect(weekHandler.showCondenseViewToggle).toEqual(true)
    })
  })

  describe('when switching between views', () => {
    test('habits in view are refreshed when the view mode is changed', async () => {
      await weekHandler.viewWeek('2021-09-20')
      await weekHandler.setTrackerStatus(suspendedHabit.id, 2, ['👋'])
      weekHandler.setViewMode('tracker')
      expect(weekHandler.habitsInView).toEqual([suspendedHabit])
      weekHandler.setViewMode('notes')
      expect(weekHandler.habitsInView).toEqual([])
    })
  })
})

test('teardown: weeks collection and habits doc are emptied', async () => {
  const weekDocs = await getDocs(query(collection(firebase.db, 'users', authUser.uid, 'weeks')))
  expect(weekDocs.size).toEqual(0)
  expect(await dbHandler.getOwnDoc('data', 'habits')).toBeUndefined()
})