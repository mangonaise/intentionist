import { useEffect } from 'react'
import { setAccentColor } from 'styles/theme'
import IntentionistIcon from './icons/IntentionistIcon'
import CenteredFlex from './primitives/CenteredFlex'
import Icon from './primitives/Icon'

const LoadingScreen = () => {
  useEffect(() => {
    setAccentColor(null)
  }, [])

  return (
    <CenteredFlex height="90vh" opacity={0.5}>
      <Icon icon={IntentionistIcon} fontSize="2.5rem" />
    </CenteredFlex>
  )
}

export default LoadingScreen