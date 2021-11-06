import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import FriendsHandler from '@/logic/app/FriendsHandler'
import ModalPopup from '@/components/app/ModalPopup'
import Flex from '@/components/primitives/Flex'
import Button from '@/components/primitives/Button'
import Icon from '@/components/primitives/Icon'
import CheckFillIcon from '@/components/icons/CheckFillIcon'
import SendIcon from '@/components/icons/SendIcon'
import CrossIcon from '@/components/icons/CrossIcon'

const OutgoingFriendRequestModal = observer(() => {
  const { outgoingFriendRequestStatus } = container.resolve(FriendsHandler)
  const [showModal, setShowModal] = useState(false)

  const status = outgoingFriendRequestStatus ?? 'sent'
  const contentMap = {
    'sending': { icon: SendIcon, text: 'Sending friend request...' },
    'sent': { icon: CheckFillIcon, text: 'Friend request sent!' },
    'error': { icon: CrossIcon, text: 'Something went wrong.' },
    'recipient-max-requests': { icon: CrossIcon, text: `Your request failed to send. That user has too many incoming friend requests.` }
  }
  const content = contentMap[status]

  if (!showModal && status === 'sending') {
    // wait for other modals to close
    new Promise(resolve => setTimeout(resolve, 275)).then(() => setShowModal(true))
  }

  return (
    <ModalPopup
      isOpen={showModal}
      closeModal={() => setShowModal(false)}
      disableClose={status === 'sending'}
    >
      <Flex column sx={{ width: '350px', mt: 4 }}>
        <Flex center column>
          <Icon
            sx={{ fontSize: '1.75rem', mb: 4 }}
            icon={content.icon}
          />
        </Flex>
        <Flex center sx={{
          p: 4, mx: 4, mb: 4,
          minHeight: '5rem',
          bg: 'whiteAlpha.5', borderRadius: 'default',
          textAlign: 'center'
        }}>
          {content.text}
        </Flex>
        {status !== 'sending' && (
          <Button onClick={() => setShowModal(false)} sx={{ m: 4, mt: 0 }}>
            OK
          </Button>
        )}
      </Flex>
    </ModalPopup>
  )
})

export default OutgoingFriendRequestModal