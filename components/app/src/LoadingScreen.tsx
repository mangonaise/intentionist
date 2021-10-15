import { Flex, Icon } from '@/components/primitives'
import { IntentionistIcon } from '@/components/icons'

const LoadingScreen = () => {
  return (
    <Flex center sx={{ position: 'fixed', left: 0, right: 0, top: 0, height: '90vh', opacity: 0.5 }}>
      <Icon icon={IntentionistIcon} sx={{ fontSize: '2.5rem' }} />
    </Flex>
  )
}

export default LoadingScreen