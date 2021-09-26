import { CenteredFlex, Icon } from '@/components/primitives'
import { IntentionistIcon } from '@/components/icons'

const LoadingScreen = () => {
  return (
    <CenteredFlex height="90vh" opacity={0.5}>
      <Icon icon={IntentionistIcon} fontSize="2.5rem" />
    </CenteredFlex>
  )
}

export default LoadingScreen