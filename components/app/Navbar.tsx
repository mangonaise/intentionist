import { observer } from 'mobx-react-lite'
import { container } from 'tsyringe'
import { handleSignOut } from '@/lib/logic/utils/authUtilities'
import ProfileHandler from '@/lib/logic/app/ProfileHandler'
import accentColor from '@/lib/logic/utils/accentColor'
import Box from '@/components/primitives/Box'
import Flex from '@/components/primitives/Flex'
import Heading from '@/components/primitives/Heading'
import Icon from '@/components/primitives/Icon'
import IconButton from '@/components/primitives/IconButton'
import Text from '@/components/primitives/Text'
import BackIcon from '@/components/icons/BackIcon'
import IntentionistIcon from '@/components/icons/IntentionistIcon'

const Navbar = () => {
  const { profileInfo } = container.resolve(ProfileHandler)

  return (
    <Box
      sx={{
        maxWidth: 'max',
        margin: 'auto',
        isolation: 'isolate'
      }}
    >
      <Flex align="center" sx={{ mb: [3, 4], pt: [0, 1, 4], pb: [0, 0, 2] }}>
        <Icon
          icon={IntentionistIcon}
          sx={{
            fontSize: ['1.6rem', '1.8rem', '2.1rem'],
            ml: 2,
            mr: [4, 4, 6],
            color: accentColor.current,
            transition: 'color 400ms',
            transform: null
          }}
        />
        <Heading
          level={1}
          sx={{
            fontSize: ['1.5rem', '1.75rem', '2rem'],
            fontWeight: 650,
            letterSpacing: '0.03ch',
            mr: 'auto'
          }}
        >
          intentionist
        </Heading>
        <Text type="div" sx={{ mr: 3, opacity: 0.5 }}>{profileInfo?.displayName}</Text>
        <IconButton onClick={handleSignOut} icon={BackIcon} />
      </Flex>
    </Box>
  )
}

export default observer(Navbar)