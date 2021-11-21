import { useContext } from 'react'
import { HabitContext } from '@/components/page/home/habit-tracker/HabitWrapper'
import SmartEmoji from '@/components/app/SmartEmoji'
import Link from '@/components/primitives/Link'
import Text from '@/components/primitives/Text'
import NextLink from 'next/link'

const HabitTitleSection = () => {
  const { habit, isSmallScreen } = useContext(HabitContext)

  return (
    <NextLink href={{ pathname: 'habit', query: { id: habit.id, returnHome: true } }}>
      <Link
        sx={{
          display: 'flex', alignItems: 'center', width: 'fit-content', px: 1,
          fontSize: ['1.2rem', '1.5rem'], fontWeight: 'medium', borderRadius: 'default'
        }}
      >
        <SmartEmoji nativeEmoji={habit.icon} rem={isSmallScreen ? 1.2 : 1.5} />
        <Text
          type="span"
          sx={{
            // todo: adjust maxWidth based on whether screen has excess width
            ml: [2, 3], maxWidth: 'min(700px, calc(100vw - 3.25rem))',
            overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
          }}
        >
          {habit.name}
        </Text>
      </Link>
    </NextLink>
  )
}

export default HabitTitleSection