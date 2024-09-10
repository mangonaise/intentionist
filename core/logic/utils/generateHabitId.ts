import { nanoid } from 'nanoid'

const generateHabitId = () => {
  return nanoid(8)
}

export default generateHabitId