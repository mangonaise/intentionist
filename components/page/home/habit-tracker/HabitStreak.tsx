import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { HabitContext } from '@/components/page/home/habit-tracker/HabitWrapper'
import HabitStatusesHandler from '@/logic/app/HabitStatusesHandler'
import Icon from '@/components/primitives/Icon'
import Text from '@/components/primitives/Text'
import Flex from '@/components/primitives/Flex'
import FlameIcon from '@/components/icons/FlameIcon'

const HabitStreak = observer(() => {
  const { streaks } = container.resolve(HabitStatusesHandler)
  const { habit } = useContext(HabitContext)

  if (habit.weeklyFrequency === null) return null

  const streak = streaks[habit.id]
  const count = streak?.count ?? 0
  const isPending = streak?.isPending ?? true

  const color = isPending ? '#888' : 'textAccent'

  return (
    <Flex center sx={{ flexDirection: ['row', 'row', 'row-reverse'] }}>
      <Icon icon={FlameIcon} sx={{ color, fontSize: ['1.2rem', '1.3rem'] }} />
      <Text
        type="span"
        sx={{ mx: 1, color, fontWeight: 'medium', fontVariantNumeric: 'tabular-nums' }}
      >
        {count ?? 0}{habit.weeklyFrequency === 7 ? 'd' : 'w'}
      </Text>
    </Flex>
  )
})

export default HabitStreak