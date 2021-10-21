import HabitFilterDropdown from './HabitFilterDropdown'
import Flex from '@/components/primitives/Flex'
import IconButton from '@/components/primitives/IconButton'
import BackIcon from '@/components/icons/BackIcon'
import PlusIcon from '@/components/icons/PlusIcon'
import NextLink from 'next/link'

const HabitsPageNavSection = () => {
  return (
    <Flex
      sx={{
        flexWrap: ['wrap', 'nowrap'],
        pb: [0, 4],
        mb: 2,
        borderBottom: 'solid 1.5px',
        borderColor: ['transparent', 'divider']
      }}
    >
      <NextLink href="/home"><IconButton icon={BackIcon} /></NextLink>
      <HabitFilterDropdown />
      <NextLink href="/habits/new">
        <IconButton
          icon={PlusIcon}
          hoverEffect="opacity"
          sx={{
            bg: 'text',
            color: 'bg',
            ml: 'auto',
            mt: [3, 0],
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