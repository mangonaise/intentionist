import { observer } from 'mobx-react-lite'
import { container } from 'tsyringe'
import { Box, Flex, Heading, Icon, IconButton, Spacer, Text } from '@/components/primitives'
import { BackIcon, IntentionistIcon } from '@/components/icons'
import { handleSignOut } from '@/lib/logic/utils/authUtilities'
import ProfileHandler from '@/lib/logic/app/ProfileHandler'
import accentColor from '@/lib/logic/utils/accentColor'

const Navbar = () => {
  const { profileInfo } = container.resolve(ProfileHandler) 

  return (
    <Box maxWidth="max" margin="auto">
      <Flex alignItems="center" mb={[4]} py={[0, 0, 4]}>
        <Icon
          icon={IntentionistIcon}
          fontSize={['2rem', '3rem']}
          mr={[4, 5, 6]}
          color={accentColor.current}
          style={{ transition: 'color 200ms '}}
        />
        <Heading as="p" fontSize={['1.5rem', '2rem']} fontWeight={650} letterSpacing="0.03ch">
          intentionist
        </Heading>
        <Spacer mr="auto" />
        <Text mr={3} opacity={0.5}>{profileInfo?.displayName}</Text>
        <IconButton onClick={handleSignOut} icon={BackIcon} />
      </Flex>
    </Box>
  )
}

export default observer(Navbar)