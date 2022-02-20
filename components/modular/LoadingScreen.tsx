import Flex from '@/components/primitives/Flex'
import Icon from '@/components/primitives/Icon'
import Text from '@/components/primitives/Text'
import IntentionistIcon from '@/components/icons/IntentionistIcon'

const LoadingScreen = () => {
  return (
    <Flex center column sx={{ position: 'fixed', left: 0, right: 0, top: 0, height: '90vh', opacity: 0.5 }}>
      <Icon icon={IntentionistIcon} sx={{ fontSize: '2.5rem', mb: 6 }} />
      <Text>Just a moment</Text>
    </Flex>
  )
}

export default LoadingScreen