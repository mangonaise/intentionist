import { useState } from 'react'
import IconButton from '@/components/primitives/IconButton'
import AddFriendIcon from '@/components/icons/AddFriendIcon'
import AddFriendModal from '@/components/page/friends/AddFriendModal'

const AddFriendButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <AddFriendModal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} />
      <IconButton
        icon={AddFriendIcon}
        onClick={() => setIsModalOpen(true)}
        hoverEffect="opacity"
        sx={{
          backgroundColor: 'text',
          color: 'bg',
          fontWeight: 'medium'
        }}
      >
        Add friend
      </IconButton>
    </>
  )
}

export default AddFriendButton