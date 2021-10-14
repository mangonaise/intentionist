import { observer } from 'mobx-react-lite'
import { container } from 'tsyringe'
import { Box, Flex, Heading, Icon, IconButton, Text } from '@/components/primitives'
import { BackIcon, IntentionistIcon } from '@/components/icons'
import { handleSignOut } from '@/lib/logic/utils/authUtilities'
import ProfileHandler from '@/lib/logic/app/ProfileHandler'
import accentColor from '@/lib/logic/utils/accentColor'

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
      <Flex align="center" sx={{ mb: 4, py: [0, 2, 4] }}>
        <Icon
          icon={IntentionistIcon}
          sx={{
            fontSize: ['1.6rem', '2rem', '2.4rem'],
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