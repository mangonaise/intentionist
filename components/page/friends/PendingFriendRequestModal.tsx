import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import FriendRequestsHandler, { PendingFriendRequestStatus } from '@/logic/app/FriendRequestsHandler'
import ModalPopup from '@/components/app/ModalPopup'
import Flex from '@/components/primitives/Flex'
import Button from '@/components/primitives/Button'
import Icon from '@/components/primitives/Icon'
import Text from '@/components/primitives/Text'
import FadeIn from '@/components/primitives/FadeIn'
import CheckFillIcon from '@/components/icons/CheckFillIcon'
import SendIcon from '@/components/icons/SendIcon'
import CrossIcon from '@/components/icons/CrossIcon'
import EllipsisIcon from '@/components/icons/EllipsisIcon'

function getModalContent(pendingStatus: PendingFriendRequestStatus, newFriendDisplayName?: string) {
  if (!pendingStatus) return
  const contentMap = {
    'sending': { icon: SendIcon, text: 'Sending friend request...' },
    'sent': { icon: CheckFillIcon, text: 'Friend request sent!' },
    'accepting': { icon: EllipsisIcon, text: 'Accepting friend request...' },
    'accepted': {
      icon: CheckFillIcon,
      text: `Added ${newFriendDisplayName} as a friend!\nYou can now view each other's weekly activity.`
    },
    'recipient-max-requests': { icon: CrossIcon, text: 'Your request failed to send. That user has too many incoming friend requests.' },
    'sender-max-requests': { icon: CrossIcon, text: 'Your request failed to send. You have too many outgoing friend requests.' },
    'recipient-max-friends': { icon: CrossIcon, text: `Couldn't accept friend request. You've reached the maximum friends limit.` },
    'sender-max-friends': { icon: CrossIcon, text: `Couldn't accept friend request. That user has reached the maximum friends limit.` },
    'error': { icon: CrossIcon, text: 'Something went wrong.' },
  }
  return contentMap[pendingStatus]
}

const PendingFriendRequestModal = observer(() => {
  const { pendingStatus, newFriendDisplayName } = container.resolve(FriendRequestsHandler)
  const [showModal, setShowModal] = useState(false)

  let content = getModalContent(pendingStatus, newFriendDisplayName)

  const isIntermediateState = pendingStatus === 'sending' || pendingStatus === 'accepting'

  if (!showModal && isIntermediateState) {
    // wait for other modals to close if needed
    const delay = pendingStatus === 'sending' ? 275 : 0
    new Promise(resolve => setTimeout(resolve, delay)).then(() => setShowModal(true))
  }

  return (
    <ModalPopup
      isOpen={showModal}
      closeModal={() => setShowModal(false)}
      disableClose={isIntermediateState}
    >
      <Flex column sx={{ width: '350px', maxWidth: 'calc(100vw - 2.4rem)', mt: 4 }}>
        <Flex center column>
          <Icon
            sx={{
              fontSize: '1.75rem', mb: 4,
              animation: isIntermediateState ? 'pulse infinite 1.5s' : null
            }}
            icon={content?.icon ?? EllipsisIcon}
          />
        </Flex>
        <Flex center column sx={{
          p: 4, mx: 4, mb: 4,
          minHeight: '5rem',
          bg: 'whiteAlpha.5', borderRadius: 'default',
          textAlign: 'center',
          '& p:not(:last-of-type)': {
            mb: 4
          }
        }}>
          {content?.text.split('\n').map((text, index) => (
            <Text type="p" key={index}>{text}</Text>
          ))}
          {isIntermediateState && (
            <FadeIn sx={{ mt: 2 }}>
              <Text sx={{ color: 'whiteAlpha.50' }}>This may take a few seconds.</Text>
            </FadeIn>
          )}
        </Flex>
        {!isIntermediateState && (
          <Button onClick={() => setShowModal(false)} sx={{ m: 4, mt: 0 }}>
            OK
          </Button>
        )}
      </Flex>
    </ModalPopup>
  )
})

export default PendingFriendRequestModal