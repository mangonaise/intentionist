import generateNoteId from '@/logic/utils/generateNoteId'

test('generates 16-character note ids', () => {
  expect(generateNoteId()).toHaveLength(16)
})

test('ids are unique', () => {
  expect(generateNoteId()).not.toEqual(generateNoteId())
})