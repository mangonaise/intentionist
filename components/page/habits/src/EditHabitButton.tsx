import { Button, Flex, Icon } from '@/components/primitives'
import { SmartEmoji } from '@/components/app'
import { PencilIcon } from '@/components/icons'
import { Habit } from '@/lib/logic/app/HabitsHandler'
import NextLink from 'next/link'

const EditHabitButton = ({ habit }: { habit: Habit }) => {
  return (
    <NextLink href={`/habits/${habit.id}`} key={habit.id}>
      <Button
        sx={{
          width: '100%', px: 3,
          backgroundColor: 'transparent',
          textAlign: 'left',
          'svg': { opacity: 0.25, },
          '&:hover': {
            backgroundColor: 'whiteAlpha.5',
            'svg': {
              opacity: 1
            },
          }
        }}
      >
        <Flex center justify="flex-start">
          <Flex center sx={{ mr: 3, fontSize: '1.2rem' }}>
            <SmartEmoji nativeEmoji={habit.icon} twemojiSize={22} />
          </Flex>
          {habit.name}
          <Icon icon={PencilIcon} sx={{ ml: 'auto', pl: 2, fontSize: '1.1rem' }} />
        </Flex>
      </Button>
    </NextLink>
  )
}

export default EditHabitButton