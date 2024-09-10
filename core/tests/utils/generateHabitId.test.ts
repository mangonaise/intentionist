import generateHabitId from '@/logic/utils/generateHabitId'

test('generates 8-character habit ids', () => {
  expect(generateHabitId()).toHaveLength(8)
})

test('ids are unique', () => {
  expect(generateHabitId()).not.toEqual(generateHabitId())
})