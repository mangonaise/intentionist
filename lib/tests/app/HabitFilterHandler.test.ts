import '@abraham/reflection'
import { container } from 'tsyringe'
import { deleteApp } from '@firebase/app'
import signInDummyUser from '@/test-setup/signInDummyUser'
import deleteHabitsDoc from '@/test-setup/deleteHabitsDoc'
import initializeFirebase, { registerFirebaseInjectionTokens } from '@/firebase-setup/initializeFirebase'
import HabitsHandler, { Habit } from '@/logic/app/HabitsHandler'
import generateHabitId from '@/logic/utils/generateHabitId'
import HabitFilterHandler from '@/logic/app/HabitFilterHandler'
import simulateInitialFetches from '../_setup/simulateInitialFetches'

// 🔨

const firebase = initializeFirebase('test-habitfilterhandler')

let habitsHandler: HabitsHandler

const activeHabit: Habit = { id: generateHabitId(), name: 'Active habit', icon: '🏃‍♂️', status: 'active' }
const suspendedHabit: Habit = { id: generateHabitId(), name: 'Suspended habit', icon: '⏸', status: 'suspended' }
const archivedHabit: Habit = { id: generateHabitId(), name: 'Archived habit', icon: '🗑️', status: 'archived' }

beforeAll(async () => {
  await signInDummyUser()
})

beforeEach(async () => {
  registerFirebaseInjectionTokens(firebase)
  await simulateInitialFetches()
  habitsHandler = container.resolve(HabitsHandler)
})

afterEach(async () => {
  await deleteHabitsDoc()
  container.clearInstances()
})

afterAll(async () => {
  await deleteApp(firebase.app)
})

// 🧪

test('filters habits correctly', async () => {
  await habitsHandler.setHabit(activeHabit)
  await habitsHandler.setHabit(suspendedHabit)
  await habitsHandler.setHabit(archivedHabit)

  const filterHandler = container.resolve(HabitFilterHandler)
  filterHandler.setFilter('archived')
  expect(filterHandler.filteredHabits).toEqual([archivedHabit])
  filterHandler.setFilter('suspended')
  expect(filterHandler.filteredHabits).toEqual([suspendedHabit])
  filterHandler.setFilter('active')
  expect(filterHandler.filteredHabits).toEqual([activeHabit])
})

test('filter defaults to active', async () => {
  await habitsHandler.setHabit(suspendedHabit)
  await habitsHandler.setHabit(archivedHabit)
  expect(container.resolve(HabitFilterHandler).filteredHabits).toEqual([])
})