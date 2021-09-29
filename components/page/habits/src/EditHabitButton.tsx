import { Habit } from '@/lib/logic/app/HabitsHandler'
import { Box, Button, CenteredFlex, Icon, Text } from '@/components/primitives'
import NextLink from 'next/link'
import styled from '@emotion/styled'
import theme from 'styles/theme'
import { PencilIcon } from '@/components/icons'

const StyledButton = styled(Button)({
  transition: 'background-color 150ms',
  backgroundColor: 'transparent',
  textAlign: 'left',
  'svg': {
    opacity: 0.25,
    transition: 'opacity 150ms'
  },
  '&:hover': {
    backgroundColor: `${theme.colors.whiteAlpha[5]}`,
    'svg': {
      opacity: 1
    },
  }
})

const EditHabitButton = ({ habit }: { habit: Habit }) => {
  return (
    <NextLink href={`/habits/${habit.id}`} key={habit.id}>
      <StyledButton width="100%" px={3}>
        <CenteredFlex justifyContent="flex-start">
          <Text as="span" mr={3} fontSize="1.2rem">{habit.icon}</Text>
          {habit.name}
          <Icon icon={PencilIcon} ml="auto" pl={2} fontSize="1.5rem" />
        </CenteredFlex>
      </StyledButton>
    </NextLink>
  )
}

export default EditHabitButton