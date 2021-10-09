import { ReactNode } from 'react'
import { Global } from '@emotion/react'
import { css } from '@theme-ui/css'
import { Icon } from '@/components/primitives'
import { CloseIcon } from '@/components/icons'
import Modal from 'react-responsive-modal'
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
            marginBottom: ['15vh', '50vh']
          }
        }
      })}
      />
      <Modal
        open={isOpen}
        onClose={closeModal}
        closeIcon={<Icon icon={CloseIcon} sx={{ color: 'whiteAlpha.40' }} />}
        center
        classNames={{
          overlay: 'modal-overlay'
        }}>
        {children}
      </Modal>
    </>
  )
}

export default ModalPopup