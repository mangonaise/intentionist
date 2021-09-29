import '@abraham/reflection'
import { container } from 'tsyringe'
import HabitsHandler, { Habit } from '../../logic/app/HabitsHandler'
import generateHabitId from '../../logic/utils/generateHabitId'
import HabitFilterHandler from '../../logic/app/HabitFilterHandler'
import signInDummyUser from '../_setup/signIn'
import resetHabits from '../_setup/resetHabits'

// 🔨

let habitsHandler: HabitsHandler

const activeHabit: Habit = { id: generateHabitId(), name: 'Active habit', icon: '🏃‍♂️', status: 'active' }
const suspendedHabit: Habit = { id: generateHabitId(), name: 'Suspended habit', icon: '⏸', status: 'suspended' }
const archivedHabit: Habit = { id: generateHabitId(), name: 'Archived habit', icon: '🗑️', status: 'archived' }

beforeAll(async () => {
  await signInDummyUser()
  habitsHandler = container.resolve(HabitsHandler)
})

afterEach(async () => {
  await resetHabits()
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

test('teardown: all habits are deleted', async () => {
  expect(habitsHandler.habits).toEqual([])
})