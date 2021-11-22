import BackIcon from '@/components/icons/BackIcon'
import Flex from '@/components/primitives/Flex'
import Heading from '@/components/primitives/Heading'
import IconButton from '@/components/primitives/IconButton'
import Spacer from '@/components/primitives/Spacer'
import NextLink from 'next/link'

const HabitsPageNavSection = () => {
  return (
    <Flex
      align="center"
      sx={{ borderBottom: 'solid 1px', borderColor: 'divider', pb: [2, 3] }}
    >
      <NextLink href="/home">
        <IconButton icon={BackIcon} sx={{ bg: 'transparent' }} />
      </NextLink>
      <Spacer ml={2} />
      <Heading level={2} sx={{ fontSize: ['1.2rem', '1.5rem'] }}>Reorder habits</Heading>
    </Flex>
  )
}

export default HabitsPageNavSection