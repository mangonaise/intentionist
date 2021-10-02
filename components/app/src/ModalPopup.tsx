import { ReactNode } from 'react'
import { Global } from '@emotion/react'
import { Icon } from '@/components/primitives'
import { CloseIcon } from '@/components/icons'
import Modal from 'react-responsive-modal'
import theme from 'styles/theme'
import 'react-responsive-modal/styles.css'
import css from '@styled-system/css'

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
            borderRadius: theme.radii.default,
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
        closeIcon={<Icon icon={CloseIcon} color="whiteAlpha.40" fontSize="1.3rem" />}
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