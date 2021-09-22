import profileHandler from '@/lib/app/profileHandler'
import authHandler from '@/lib/auth'
import FadeIn from './primitives/FadeIn'
import BackIcon from './icons/BackIcon'
import IntentionistIcon from './icons/IntentionistIcon'
import Flex from './primitives/Flex'
import Heading from './primitives/Heading'
import Icon from './primitives/Icon'
import IconButton from './primitives/IconButton'
import Spacer from './primitives/Spacer'
import Text from './primitives/Text'

const Navbar = () => {
  return (
    <FadeIn maxWidth="max" margin="auto">
      <Flex alignItems="center" mb={[4]} py={[0, 0, 4]}>
        <Icon icon={IntentionistIcon} fontSize={['2rem', '3rem']} mr={[4, 5, 6]} />
        <Heading as="p" fontSize={['1.5rem', '2rem']} fontWeight={650} letterSpacing="0.03ch">
          intentionist
        </Heading>
        <Spacer mr="auto" />
        <Text mr={3} opacity={0.5}>{profileHandler().profileInfo?.displayName}</Text>
        <IconButton onClick={authHandler.handleSignOut} icon={BackIcon} />
      </Flex>
    </FadeIn>
  )
}

export default Navbar