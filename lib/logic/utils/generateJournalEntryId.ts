import { nanoid } from 'nanoid'

const generateJournalEntryId = () => {
  return nanoid(16)
}

export default generateJournalEntryId