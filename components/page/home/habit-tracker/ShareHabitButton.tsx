import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { HabitContext } from '@/components/page/home/habit-tracker/HabitWrapper'
import HabitsHandler from '@/logic/app/HabitsHandler'
import DisplayedHabitsHandler from '@/logic/app/DisplayedHabitsHandler'
import SelectDropdown from '@/components/app/SelectDropdown'

const ShareHabitButton = observer(({ anchorRight }: { anchorRight?: boolean }) => {
  const { habit } = useContext(HabitContext)
  const { sharedHabitIds, addSharedHabit, removeSharedHabit } = container.resolve(HabitsHandler)

  if (!habit.friendUid) return null

  const isSharing = !!sharedHabitIds[habit.id]

  function handleAddSharedHabit() {
    if (!habit.friendUid) return null
    addSharedHabit({ friendUid: habit.friendUid, habitId: habit.id })
  }

  function handleRemoveSharedHabit() {
    if (!habit.friendUid) return null
    removeSharedHabit({ friendUid: habit.friendUid, habitId: habit.id })
    
    const { selectedFriendUid, viewUser } = container.resolve(DisplayedHabitsHandler)
    if (!selectedFriendUid) {
      viewUser(null)
    }
  }

  return (
    <SelectDropdown
      title={isSharing ? 'Sharing' : 'Not sharing'}
      sx={{ '& button': { px: '0.85rem' } }}
      highlight={isSharing}
      highlightColor="buttonAccentAlt"
      anchorRight={anchorRight}
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