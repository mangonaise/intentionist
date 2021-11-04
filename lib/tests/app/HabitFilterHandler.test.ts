import '@abraham/reflection'
import { container, DependencyContainer } from 'tsyringe'
import signInDummyUser from '@/test-setup/signInDummyUser'
import deleteHabitsDoc from '@/test-setup/deleteHabitsDoc'
import initializeHabitsHandler from '@/test-setup/initializeHabitsHandler'
import HabitsHandler, { Habit } from '@/logic/app/HabitsHandler'
import generateHabitId from '@/logic/utils/generateHabitId'
import HabitFilterHandler from '@/logic/app/HabitFilterHandler'

// 🔨

let habitsHandler: HabitsHandler
let testContainer: DependencyContainer

const activeHabit: Habit = { id: generateHabitId(), name: 'Active habit', icon: '🏃‍♂️', status: 'active' }
const suspendedHabit: Habit = { id: generateHabitId(), name: 'Suspended habit', icon: '⏸', status: 'suspended' }
const archivedHabit: Habit = { id: generateHabitId(), name: 'Archived habit', icon: '🗑️', status: 'archived' }

beforeAll(async () => {
  await signInDummyUser()
})

beforeEach(async () => {
  testContainer = container.createChildContainer()
  habitsHandler = await initializeHabitsHandler(testContainer)
})

afterEach(async () => {
  await deleteHabitsDoc()
})

// 🧪

test('filters habits correctly', async () => {
  await habitsHandler.setHabit(activeHabit)
  await habitsHandler.setHabit(suspendedHabit)
  await habitsHandler.setHabit(archivedHabit)

  const filterHandler = testContainer.resolve(HabitFilterHandler)
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
  expect(testContainer.resolve(HabitFilterHandler).filteredHabits).toEqual([])
})