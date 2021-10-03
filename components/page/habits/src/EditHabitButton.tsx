import { Habit } from '@/lib/logic/app/HabitsHandler'
import { Button, CenteredFlex, Icon, Text } from '@/components/primitives'
import { PencilIcon } from '@/components/icons'
import NextLink from 'next/link'
import styled from '@emotion/styled'
import css from '@styled-system/css'
import { SmartEmoji } from '@/components/app'

const StyledButton = styled(Button)(css({
  width: '100%',
  px: 3,
  transition: 'background-color 150ms',
  backgroundColor: 'transparent',
  textAlign: 'left',
  'svg': {
    opacity: 0.25,
    transition: 'opacity 150ms'
  },
  '&:hover': {
    backgroundColor: 'whiteAlpha.5',
    'svg': {
      opacity: 1
    },
  }
}))

const EditHabitButton = ({ habit }: { habit: Habit }) => {
  return (
    <NextLink href={`/habits/${habit.id}`} key={habit.id}>
      <StyledButton>
        <CenteredFlex justifyContent="flex-start">
          <CenteredFlex mr={3} fontSize="1.2rem">
            <SmartEmoji nativeEmoji={habit.icon} twemojiSize={22} />
          </CenteredFlex>
          {habit.name}
          <Icon icon={PencilIcon} ml="auto" pl={2} fontSize="1.5rem" />
        </CenteredFlex>
      </StyledButton>
    </NextLink>
  )
}

export default EditHabitButton