import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'
import FriendsHandler from '@/logic/app/FriendsHandler'
import FriendsLoadingIndicator from '@/components/page/friends/FriendsLoadingIndicator'
import SmartEmoji from '@/components/app/SmartEmoji'
import ModalPopup from '@/components/app/ModalPopup'
import EmptyPageText from '@/components/app/EmptyPageText'
import FadeIn from '@/components/primitives/FadeIn'
import Flex from '@/components/primitives/Flex'
import Spacer from '@/components/primitives/Spacer'
import Text from '@/components/primitives/Text'
import Heading from '@/components/primitives/Heading'
import Box from '@/components/primitives/Box'
import Button from '@/components/primitives/Button'
import IconButton from '@/components/primitives/IconButton'
import CrossIcon from '@/components/icons/CrossIcon'

const FriendsList = observer(() => {
  const { friends, hasLoadedFriends } = container.resolve(FriendsHandler)
  const [removingFriendUid, setRemovingFriendUid] = useState<null | string>(null)

  if (!hasLoadedFriends) {
    return <FriendsLoadingIndicator />
  }

  return (
    <>
      <RemoveFriendModal removingFriendUid={removingFriendUid} closeModal={() => setRemovingFriendUid(null)} />
      <FadeIn>
        {friends.length === 0
          ? <EmptyPageText text="You haven't added any friends yet." />
          : <>
            {friends.map((friend) => (
              <Flex align="center" sx={{ mb: 2 }} key={friend.username}>
                <Flex align="center" flexWrap sx={{ maxWidth: 'calc(100vw - 4rem)' }}>
                  <SmartEmoji nativeEmoji={friend.avatar} rem={1.8} />
                  <Text type="span" sx={{ mx: 2 }}>{friend.displayName}</Text>
                  <Text
                    type="span"
                    sx={{ py: 1, color: 'whiteAlpha.60', fontWeight: 'light' }}>
                    @{friend.username}
                  </Text>
                </Flex>
                <Spacer ml="auto" />
                <IconButton
                  icon={CrossIcon}
                  onClick={() => setRemovingFriendUid(friend.uid)}
                  sx={{ bg: 'transparent', '&:not(:hover)': { color: 'whiteAlpha.60' } }}
                />
              </Flex>
            ))}
          </>}
      </FadeIn>
    </>
  )
})

type FriendRemovalStatus = 'confirm' | 'removing' | 'removed'

const getModalContent = (status: FriendRemovalStatus, displayName: string) => {
  const modalContentMap: { [status in FriendRemovalStatus]: { title: string, body: string } } = {
    confirm: {
      title: 'Remove friend',
      body: `Are you sure you want to remove ${displayName} as a friend?`
    },
    removing: {
      title: 'Please wait',
      body: `Removing ${displayName}...`
    },
    removed: {
      title: 'Friend removed',
      body: `You are no longer friends with ${displayName}.`
    }
  }
  return modalContentMap[status]
}

const RemoveFriendModal = ({ removingFriendUid, closeModal }: { removingFriendUid: string | null, closeModal: () => void }) => {
  const { removeFriend, friends } = container.resolve(FriendsHandler)
  const [friendRemovalStatus, setFriendRemovalStatus] = useState<FriendRemovalStatus>('confirm')
  const [modalContent, setModalContent] = useState({ title: '', body: '' })
  const [friendDisplayName, setFriendDisplayName] = useState('')

  useEffect(() => {
    if (removingFriendUid) {
      setFriendRemovalStatus('confirm')
      const displayName = friends.find((friend) => friend.uid === removingFriendUid)?.displayName ?? 'error'
      setFriendDisplayName(displayName)

    }
  }, [removingFriendUid])

  useEffect(() => {
    setModalContent(getModalContent(friendRemovalStatus, friendDisplayName))
  }, [friendRemovalStatus, friendDisplayName])

  async function handleRemoveFriend() {
    if (!removingFriendUid) return
    setFriendRemovalStatus('removing')
    await removeFriend(removingFriendUid)
    setFriendRemovalStatus('removed')
  }

  return (
    <ModalPopup
      isOpen={!!removingFriendUid}
      closeModal={closeModal}
      disableClose={friendRemovalStatus === 'removing'}
    >
      <Box sx={{ width: '350px', maxWidth: 'calc(100vw - 2.4rem)' }}>
        <Heading level={2} sx={{ my: 6, px: 4, textAlign: 'center' }}>
          {modalContent.title}
        </Heading>
        <Box sx={{
          p: 4, m: 4,
          bg: 'whiteAlpha.5', borderRadius: 'default',
          fontWeight: 'light', textAlign: 'center'
        }}>
          {modalContent.body}
        </Box>
        {friendRemovalStatus === 'confirm' && (
          <Flex sx={{ flexWrap: ['wrap', 'nowrap'], flexDirection: ['column-reverse', 'row'], width: '100%', mb: 4, px: 4 }}>
            <Button onClick={closeModal} sx={{ flex: 1, mr: [0, 3], mt: [3, 0], minWidth: ['100%', 'auto'] }}>
              Cancel
            </Button>
            <Button
              onClick={handleRemoveFriend}
              hoverEffect="opacity"
              sx={{ flex: 1, minWidth: ['100%', 'auto'], bg: 'focus', fontWeight: 'medium' }}
            >
              Remove
            </Button>
          </Flex>
        )}
        {friendRemovalStatus === 'removed' && (
          <Box sx={{ width: '100%', mb: 4, px: 4 }}>
            <Button onClick={closeModal} sx={{ width: '100%' }}>
              OK
            </Button>
          </Box>
        )}
      </Box>
    </ModalPopup>
  )
}

export default FriendsList