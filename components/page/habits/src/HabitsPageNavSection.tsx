import { BackIcon, PlusIcon } from '@/components/icons'
import { Flex, IconButton } from '@/components/primitives'
import NextLink from 'next/link'
import HabitFilterDropdown from './HabitFilterDropdown'

const HabitsPageNavSection = () => {
  return (
    <Flex
      pb={[0, 4]}
      mb={2}
      borderBottom="solid 1.5px"
      borderColor={['transparent', 'divider']}
      flexWrap={['wrap', 'nowrap']}
    >
      <NextLink href="/home"><IconButton icon={BackIcon} /></NextLink>
      <HabitFilterDropdown />
      <NextLink href="/habits/new">
        <IconButton
          icon={PlusIcon}
          bg="text"
          color="bg"
          reduceHoverOpacity
          ml="auto"
          mt={[3, 0]}
          width={['100%', 'auto']}
          fontWeight="medium"
        >
          Add habit
        </IconButton>
      </NextLink>
    </Flex>
  )
}

export default HabitsPageNavSection