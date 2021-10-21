import { ReactNode } from 'react'
import { Global } from '@emotion/react'
import { css } from '@theme-ui/css'
import Modal from 'react-responsive-modal'
import Icon from '@/components/primitives/Icon'
import CloseIcon from '@/components/icons/CloseIcon'
import 'react-responsive-modal/styles.css'

interface Props {
  isOpen: boolean,
  closeModal: () => void,
  children: ReactNode
}

const ModalPopup = ({ isOpen, closeModal, children }: Props) => {
  return (
    <>
      <Global styles={css({
        '.react-responsive-modal': {
          '&-modal': {
            backgroundColor: '#292929',
            borderRadius: 'default',
            boxShadow: 'none',
            padding: 0,
            top: '10%',
            transform: 'scale(0.99)',
            '@keyframes in': {
              '0%': { opacity: 0, transform: 'scale(0.925)' },
              '100%': { opacity: 1, transform: 'scale(0.99)' }
            },
            '@keyframes out': {
              '0%': { opacity: 1, transform: 'scale(0.99)' },
              '100%': { opacity: 0, transform: 'scale(0.925)' }
            }
          }
        }
      })}
      />
      <Modal
        open={isOpen}
        onClose={closeModal}
        closeIcon={<Icon icon={CloseIcon} sx={{ color: 'whiteAlpha.40' }} />}
        animationDuration={250}
        classNames={{
          modalAnimationIn: 'in',
          modalAnimationOut: 'out'
        }}
      >
        {children}
      </Modal>
    </>
  )
}

export default ModalPopup