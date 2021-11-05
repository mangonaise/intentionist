import { observer } from 'mobx-react-lite'
import { Fragment } from 'react'
import accentColor from '@/logic/utils/accentColor'
import useMediaQuery from '@/hooks/useMediaQuery'
import SmartEmoji from '@/components/app/SmartEmoji'
import Flex from '@/components/primitives/Flex'
import Heading from '@/components/primitives/Heading'
import IconButton from '@/components/primitives/IconButton'
import Text from '@/components/primitives/Text'
import Grid from '@/components/primitives/Grid'
import Box from '@/components/primitives/Box'
import ArrowRightIcon from '@/components/icons/ArrowRightIcon'
import NextLink from 'next/link'

const GetStartedSection = observer(() => {
  return (
    <Flex center sx={{ mt: ['12.5vh', '3vh'] }}>
      <Table />
      <Flex column align="center" sx={{ textAlign: 'center' }}>
        <Heading level={2} sx={{ fontSize: ['1.75rem', '2.75rem'], fontWeight: 'bold' }}>
          Let's get started
        </Heading>
        <Text sx={{ mt: 3, mb: [2, 4], fontWeight: 'light' }}>
          To begin, simply add the habits you'd like to track.
        </Text>
        <NextLink href="/habits">
          <IconButton
            right icon={ArrowRightIcon}
            sx={{
              marginTop: [3, 6],
              backgroundColor: 'text',
              color: 'bg',
              fontWeight: 'medium'
            }}
            hoverEffect="opacity"
          >
            Start
          </IconButton>
        </NextLink>
      </Flex>
    </Flex>
  )
})

const fakeHabits = [
  {
    icon: '⏰',
    name: 'Wake up early',
    statuses: [['✅'], ['💤'], ['✅'], ['✅']],
  },
  {
    icon: '📚',
    name: 'Read',
    statuses: [['👍'], [], ['📕'], ['🤏']]
  },
  {
    icon: '✍️',
    name: 'Study',
    statuses: [['👍'], ['⭐'], ['🤏'], []]
  },
  {
    icon: '💦',
    name: 'Exercise',
    statuses: [['🏃'], ['💪'], [], ['🚶‍♂️']]
  },
  {
    icon: '🌼',
    name: 'Relax',
    statuses: [['⭐'], ['👎'], ['👍'], ['⭐']]
  },
  {
    icon: '🍎',
    name: 'Healthy eating',
    statuses: [['👍'], ['🥗'], [], ['👍']]
  },
  {
    icon: '🙂',
    name: 'Mood',
    statuses: [['😊'], ['😬'], ['🙂'], ['🙂']]
  }
]

const Table = () => {
  const display = useMediaQuery('(max-width: 1000px)', false, true)

  if (!display) return null

  return (
    <Box
      sx={{
        position: 'relative',
        marginRight: '7.5rem',
        userSelect: 'none',
        '&::after': {
          position: 'absolute',
          content: '""',
          inset: 0,
          left: '60%',
          backgroundImage: 'linear-gradient(to right, transparent, var(--background-color))'
        }
      }}
    >
      <Grid
        sx={{
          gridTemplateColumns: 'auto repeat(4, 6rem)',
          borderBottom: 'solid 1px',
          borderColor: 'grid'
        }}
      >
        <div />
        {['Mon', 'Tue', 'Wed', 'Thu'].map((day) => (
          <FakeWeekdayCell day={day} key={day} />
        ))}
        {fakeHabits.map((habit) => <Fragment key={habit.name}>
          <FakeHabitCell icon={habit.icon} name={habit.name} />
          {habit.statuses.map((statuses, index) => <FakeStatusCell statuses={statuses} key={index} />)}
        </Fragment>)}
      </Grid>
    </Box>
  )
}

const FakeWeekdayCell = ({ day }: { day: string }) => {
  return (
    <Flex center sx={{ minHeight: 'row' }}>
      {day}
    </Flex>
  )
}

const FakeHabitCell = ({ icon, name }: { icon: string, name: string }) => {
  return (
    <Flex
      align="center"
      sx={{
        minHeight: 'row',
        paddingRight: 4,
        borderTop: 'solid 1px',
        borderRight: 'solid 1px',
        borderColor: 'grid'
      }}
    >
      <SmartEmoji nativeEmoji={icon} rem={1.2} />
      <Text type="span" sx={{ ml: 2 }}>{name}</Text>
    </Flex>
  )
}

const FakeStatusCell = ({ statuses }: { statuses: string[] }) => {
  return (
    <Flex
      center
      sx={{
        borderTop: 'solid 1px',
        borderRight: 'solid 1px',
        borderColor: 'grid',
        backgroundColor: statuses.length ? 'whiteAlpha.3' : null
      }}
    >
      {statuses.map((emoji) => (
        <Flex center sx={{ px: 1 }} key={emoji}>
          <SmartEmoji nativeEmoji={emoji} rem={1.2} />
        </Flex>
      ))}
    </Flex>
  )
}

export default GetStartedSection