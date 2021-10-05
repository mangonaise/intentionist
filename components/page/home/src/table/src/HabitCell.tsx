import { SmartEmoji } from '@/components/app'
import { CenteredFlex } from '@/components/primitives'
import styled from '@emotion/styled'
import css from '@styled-system/css'

const HabitCell = () => {
  return (
    <CenteredFlex minHeight="row" borderBottom="solid 1px" borderColor="grid" flexStart pl={2}>
      <SmartEmoji nativeEmoji="🎯" nativeFontSize="1.25rem" twemojiSize={18} />
      <CellText>
        Habit
      </CellText>
    </CenteredFlex>
  )
}

const CellText = styled.span(css({
  maxWidth: 'min(30vw, 50ch)',
  marginLeft: 2,
  paddingY: '2px',
  paddingRight: ['0.6em', 3],
  overflowWrap: 'break-word'
}))

export default HabitCell