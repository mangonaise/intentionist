import { nanoid } from 'nanoid'

const generateNoteId = () => {
  return nanoid(16)
}

export default generateNoteId