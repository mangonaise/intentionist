import { useState } from 'react'
import ModalPopup from '@/components/app/ModalPopup'
import Box from '@/components/primitives/Box'
import Flex from '@/components/primitives/Flex'
import Heading from '@/components/primitives/Heading'
import IconButton from '@/components/primitives/IconButton'
import Text from '@/components/primitives/Text'
import InfoIcon from '@/components/icons/InfoIcon'

const EmojiPaletteInfo = () => {
  const [showModal, setShowModal] = useState(false)

  function openModal() {
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
  }

  return (
    <>
      <IconButton onClick={openModal} icon={InfoIcon} sx={{ p: '0.7rem', bg: 'transparent' }} />
      <ModalPopup isOpen={showModal} closeModal={closeModal}>
        <Flex center column>
          <Heading level={2} sx={{ my: 6 }}>Quick palette</Heading>
          <Box sx={{ px: 4, pb: 4 }}>
            <Box sx={{
              maxWidth: '400px',
              bg: 'whiteAlpha.5',
              borderRadius: 'default',
              p: 4,
              fontWeight: 'light',
              textAlign: 'center',
              lineHeight: 1.5,
              'img': { borderRadius: 'default' }
            }}>
              <Text sx={{ mb: 4 }}>
                Every day, you can choose one or more emojis to represent the status of this habit.{' '}
                Use the quick palette for easy access to emojis that you will commonly use.
              </Text>
              <img
                src="/images/quickpalette.png"
                sx={{ size: '100%' }}
                alt="An example of the quick palette being used for an exercise habit"
              />
            </Box>
          </Box>
        </Flex>
      </ModalPopup>
    </>
  )
}

export default EmojiPaletteInfo