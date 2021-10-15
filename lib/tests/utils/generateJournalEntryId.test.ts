import generateJournalEntryId from '@/logic/utils/generateJournalEntryId'

test('generates 16-character journal entry ids', () => {
  expect(generateJournalEntryId()).toHaveLength(16)
})

test('ids are unique', () => {
  expect(generateJournalEntryId()).not.toEqual(generateJournalEntryId())
})