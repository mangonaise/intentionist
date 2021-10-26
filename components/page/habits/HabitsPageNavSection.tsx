import HabitFilterDropdown from './HabitFilterDropdown'
import Flex from '@/components/primitives/Flex'
import IconButton from '@/components/primitives/IconButton'
import BackIcon from '@/components/icons/BackIcon'
import PlusIcon from '@/components/icons/PlusIcon'
import NextLink from 'next/link'
import Spacer from '@/components/primitives/Spacer'

const HabitsPageNavSection = () => {
  return (
    <Flex
      sx={{
        flexWrap: ['wrap', 'nowrap'],
        pb: [0, 3],
        borderBottom: 'solid 1.5px',
        borderColor: ['transparent', 'divider']
      }}
    >
      <NextLink href="/home"><IconButton icon={BackIcon} /></NextLink>
      <Spacer ml={2} />
      <HabitFilterDropdown />
      <NextLink href="/habits/new">
        <IconButton
          icon={PlusIcon}
          hoverEffect="opacity"
          sx={{
            bg: 'text',
            color: 'bg',
            ml: 'auto',
            mt: [2, 0],
            width: ['100%', 'auto'],
            fontWeight: 'medium'
          }}
        >
          Add habit
        </IconButton>
      </NextLink>
    </Flex>
  )
}

export default HabitsPageNavSection