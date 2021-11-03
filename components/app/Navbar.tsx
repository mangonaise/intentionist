import { observer } from 'mobx-react-lite'
import { container } from 'tsyringe'
import { handleSignOut } from '@/lib/logic/utils/authUtilities'
import ProfileHandler from '@/lib/logic/app/ProfileHandler'
import DbHandler from '@/lib/logic/app/DbHandler'
import accentColor from '@/lib/logic/utils/accentColor'
import Dropdown from '@/components/app/Dropdown'
import Box from '@/components/primitives/Box'
import Flex from '@/components/primitives/Flex'
import Heading from '@/components/primitives/Heading'
import Icon from '@/components/primitives/Icon'
import Spacer from '@/components/primitives/Spacer'
import Text from '@/components/primitives/Text'
import IntentionistIcon from '@/components/icons/IntentionistIcon'
import CloudUploadingIcon from '@/components/icons/CloudUploadingIcon'
import CloudSyncedIcon from '@/components/icons/CloudSyncedIcon'
import SmartEmoji from './SmartEmoji'
import theme from 'styles/theme'

const Navbar = () => {
  return (
    <Box sx={{ position: 'absolute', top: 2, left: 2, right: 2 }}>
      <Flex
        align="center"
        sx={{ height: theme.navbarHeights, maxWidth: 'max', m: 'auto', paddingBottom: 2 }}
      >
        <MainHeading />
        <CloudSyncIndicator />
        <Spacer mr={3} />
        <UserActionsDropdown />
      </Flex>
    </Box>
  )
}

const MainHeading = observer(() => {
  return (
    <>
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
    </>
  )
})

const CloudSyncIndicator = observer(() => {
  const { isWriteComplete } = container.resolve(DbHandler)
  return (
    <Icon
      icon={isWriteComplete ? CloudSyncedIcon : CloudUploadingIcon}
      sx={{
        transform: 'scale(1.6)',
        opacity: isWriteComplete ? 0.5 : 1,
        transition: 'opacity 150ms'
      }}
    />
  )
})

const UserActionsDropdown = observer(() => {
  const { profileInfo } = container.resolve(ProfileHandler)

  return (
    <Dropdown
      anchorRight
      title={
        <Flex center sx={{ mr: '-0.3rem' }}>
          <SmartEmoji nativeEmoji={profileInfo?.avatar ?? '🙂'} rem={1.75} />
        </Flex>
      }
      sx={{
        '& > button': { px: 2, bg: 'transparent', borderRadius: '99px' }
      }}
    >
      <Flex
        center
        flexWrap
        sx={{
          height: '2rem',
          minWidth: '10rem',
          paddingX: 4,
          backgroundColor: 'whiteAlpha.10',
          borderRadius: 'default',
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          fontSize: '0.8rem',
          maxWidth: 'calc(100vw - 1rem)'
        }}
      >
        <Text type="span">
          {profileInfo?.displayName}
        </Text>
        <Text type="span" sx={{ color: 'whiteAlpha.70', ml: 2 }}>
          @{profileInfo?.username}
        </Text>
      </Flex>
      <Dropdown.Item href="/settings/profile" sx={{ borderRadius: '0 !important' }}>
        Your profile
      </Dropdown.Item>
      <Dropdown.Item href="/friends">Friends</Dropdown.Item>
      <Dropdown.Item href="/settings/account">Settings</Dropdown.Item>
      <Dropdown.Item itemAction={handleSignOut}>Sign out</Dropdown.Item>
    </Dropdown>
  )
})

export default Navbar