import { observer } from 'mobx-react-lite'
import { container } from 'tsyringe'
import { handleSignOut } from '@/lib/logic/utils/authUtilities'
import ProfileHandler from '@/lib/logic/app/ProfileHandler'
import accentColor from '@/lib/logic/utils/accentColor'
import Dropdown from '@/components/app/Dropdown'
import Box from '@/components/primitives/Box'
import Flex from '@/components/primitives/Flex'
import Heading from '@/components/primitives/Heading'
import Icon from '@/components/primitives/Icon'
import IntentionistIcon from '@/components/icons/IntentionistIcon'
import SmartEmoji from './SmartEmoji'
import theme from 'styles/theme'

const Navbar = () => {
  return (
    <Box sx={{ position: 'absolute', top: 2, left: 2, right: 2 }}>
      <Flex
        align="center"
        sx={{
          height: theme.navbarHeights,
          maxWidth: 'max',
          margin: 'auto',
          paddingBottom: '0.5rem'
        }}
      >
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
        <UserActionsDropdown />
      </Flex>
    </Box>
  )
}

const UserActionsDropdown = () => {
  const { profileInfo } = container.resolve(ProfileHandler)

  return (
    <Dropdown
      anchorRight
      noArrow
      title={<SmartEmoji nativeEmoji={profileInfo?.avatar ?? '🙂'} rem={1.5} />}
      sx={{
        '& > button': {
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          minHeight: '2.5rem', width: '2.5rem', borderRadius: '100%'
        }
      }}
    >
      <Dropdown.Item sx={{ opacity: 0.5, minWidth: '10rem' }}>Your profile</Dropdown.Item>
      <Dropdown.Item sx={{ opacity: 0.5 }}>Friends</Dropdown.Item>
      <Dropdown.Item sx={{ opacity: 0.5 }}>Settings</Dropdown.Item>
      <Dropdown.Item itemAction={handleSignOut}>Sign out</Dropdown.Item>
    </Dropdown>
  )
}

export default observer(Navbar)