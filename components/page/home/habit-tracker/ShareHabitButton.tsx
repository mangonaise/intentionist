import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { HabitContext } from '@/components/page/home/habit-tracker/HabitWrapper'
import HabitsHandler from '@/logic/app/HabitsHandler'
import SelectDropdown from '@/components/app/SelectDropdown'

const ShareHabitButton = observer(() => {
  const { habit } = useContext(HabitContext)
  const { sharedHabitsIdsByFriend, addSharedHabit, removeSharedHabit } = container.resolve(HabitsHandler)

  if (!habit.friendUid) return null

  const isSharing = !!sharedHabitsIdsByFriend[habit.friendUid]?.find((habitId) => habitId === habit.id)

  function handleAddSharedHabit() {
    if (!habit.friendUid) return null
    addSharedHabit({ friendUid: habit.friendUid, habitId: habit.id })
  }

  function handleRemoveSharedHabit() {
    if (!habit.friendUid) return null
    removeSharedHabit({ friendUid: habit.friendUid, habitId: habit.id })
  }

  return (
    <SelectDropdown
      title={isSharing ? 'Sharing' : 'Not sharing'}
      sx={{ '& button': { px: '0.85rem' } }}
      highlight={isSharing}
      highlightColor="buttonAccentAlt"
    >
      <SelectDropdown.Item
        title={isSharing ? 'Stop sharing' : 'Set as shared habit'}
        description={`This habit will${isSharing ? ' no longer' : ''} appear alongside your active habits.`}
        onClick={isSharing ? handleRemoveSharedHabit : handleAddSharedHabit}
        selected={false}
      />
    </SelectDropdown>
  )
})

export default ShareHabitButton