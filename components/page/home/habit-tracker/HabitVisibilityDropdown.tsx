import { container } from 'tsyringe'
import { useContext } from 'react'
import HabitsHandler, { HabitVisibility } from '@/logic/app/HabitsHandler'
import { HabitContext } from '@/components/page/home/habit-tracker/HabitWrapper'
import Dropdown from '@/components/app/Dropdown'
import Text from '@/components/primitives/Text'
import Icon from '@/components/primitives/Icon'
import CheckIcon from '@/components/icons/CheckIcon'
import Flex from '@/components/primitives/Flex'

const HabitVisibilityDropdown = () => {
  const { habit, isLargeScreen } = useContext(HabitContext)
  const isPrivate = habit.visibility === 'private'

  function handleChangeVisibility(visibility: HabitVisibility) {
    const updatedHabit = { ...habit, visibility }
    container.resolve(HabitsHandler).setHabit(updatedHabit)
  }

  return (
    <Dropdown
      title={isPrivate ? 'Private' : 'Public'}
      noArrow
      anchorRight={isLargeScreen}
      sx={{
        '& > button': {
          minHeight: ['1.6rem', '1.6rem', '1.75rem'],
          paddingX: 3,
          backgroundColor: isPrivate ? 'whiteAlpha.5' : 'buttonAccent',
          borderRadius: '99px',
          color: isPrivate ? 'whiteAlpha.60' : 'text',
          fontWeight: isPrivate ? 'normal' : 'medium',
          '&:hover': {
            backgroundColor: isPrivate ? undefined : 'accent',
            opacity: isPrivate ? 1 : 0.85
          }
        }
      }}
    >
      <VisibilityDropdownItem
        title="Private"
        description="Only you will be able to see this habit."
        selected={isPrivate}
        onClick={() => handleChangeVisibility('private')}
      />
      <VisibilityDropdownItem
        title="Visible to friends"
        description="Friends will be able to see your tracker activity and notes for this habit."
        selected={!isPrivate}
        onClick={() => handleChangeVisibility('public')}
      />
    </Dropdown>
  )
}

interface VisibilityDropdownItemProps {
  title: string,
  description: string,
  selected: boolean,
  onClick: () => void
}

const VisibilityDropdownItem = ({ title, description, selected, onClick }: VisibilityDropdownItemProps) => {
  return (
    <Dropdown.Item
      sx={{ py: 3 }}
      itemAction={onClick}
    >
      <Flex asSpan flexWrap align="center">
        {title}{selected && <CheckMark />}
        <Text
          sx={{
            mt: 2, maxWidth: '10.5rem', minWidth: '100%',
            color: 'whiteAlpha.70', fontWeight: 'light', lineHeight: 1.15
          }}
        >
          {description}
        </Text>
      </Flex>
    </Dropdown.Item>
  )
}

const CheckMark = () => {
  return (
    <Icon icon={CheckIcon} sx={{ ml: 2 }} />
  )
}

export default HabitVisibilityDropdown