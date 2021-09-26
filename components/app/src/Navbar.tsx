import { observer } from 'mobx-react-lite'
import { FadeIn, Flex, Heading, Icon, IconButton, Spacer, Text } from '@/components/primitives'
import { BackIcon, IntentionistIcon } from '@/components/icons'
import profileHandler from '@/logic/app/profileHandler'
import authHandler from '@/logic/app/authHandler'
import accentColorHandler from '@/logic/ui/accentColorHandler'

const Navbar = () => {
  return (
    <FadeIn maxWidth="max" margin="auto">
      <Flex alignItems="center" mb={[4]} py={[0, 0, 4]}>
        <Icon
          icon={IntentionistIcon}
          fontSize={['2rem', '3rem']}
          mr={[4, 5, 6]}
          color={accentColorHandler.accentColor}
          style={{ transition: 'color 200ms '}}
        />
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

export default observer(Navbar)