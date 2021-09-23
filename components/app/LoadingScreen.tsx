import CenteredFlex from '../primitives/CenteredFlex'
import Icon from '../primitives/Icon'
import IntentionistIcon from '../icons/IntentionistIcon'

const LoadingScreen = () => {
  return (
    <CenteredFlex height="90vh" opacity={0.5}>
      <Icon icon={IntentionistIcon} fontSize="2.5rem" />
    </CenteredFlex>
  )
}

export default LoadingScreen