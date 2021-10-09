import { Flex, Icon } from '@/components/primitives'
import { IntentionistIcon } from '@/components/icons'

const LoadingScreen = () => {
  return (
    <Flex center sx={{ height: '90vh', opacity: 0.5 }}>
      <Icon icon={IntentionistIcon} sx={{ fontSize: '2.5rem' }} />
    </Flex>
  )
}

export default LoadingScreen