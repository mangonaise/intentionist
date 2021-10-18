import { Flex, Button } from '@/components/primitives'

const TimerAdjustButtons = () => {
  return (
    <Flex
      sx={{
        width: '100%',
        '& button': {
          flex: 1,
          paddingX: 0,
          fontWeight: 'semibold',
          '&:not(:first-of-type)': {
            backgroundColor: 'focus',
            color: 'text'
          },
          '&:not(:last-of-type)': {
            marginRight: 2
          }
        }
      }}
    >
      <Button>0</Button>
      <Button hoverEffect="opacity">+20</Button>
      <Button hoverEffect="opacity">+5</Button>
      <Button hoverEffect="opacity">+1</Button>
    </Flex>
  )
}

export default TimerAdjustButtons