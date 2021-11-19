import Icon from '@/components/primitives/Icon'
import FlameIcon from '@/components/icons/FlameIcon'
import Text from '@/components/primitives/Text'

const HabitStreak = () => {
  return (
    <>
      <Icon icon={FlameIcon} sx={{ color: 'textAccent', fontSize: ['1.2rem', '1.3rem'] }} />
      <Text type="span" sx={{ ml: 1, color: 'whiteAlpha.60' }}>
        ...
      </Text>
    </>
  )
}

export default HabitStreak