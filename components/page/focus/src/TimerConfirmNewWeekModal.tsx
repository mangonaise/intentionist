import { ModalPopup } from '@/components/app'
import { Box, Button, Flex, Heading, Text } from '@/components/primitives'
import { format } from 'date-fns'

interface Props {
  isOpen: boolean,
  onConfirmStart: () => void
  onCloseModal: () => void
}

const TimerConfirmNewWeekModal = ({ isOpen, onConfirmStart, onCloseModal }: Props) => {
  function handleConfirmStart() {
    onConfirmStart()
    onCloseModal()
  }

  return (
    <ModalPopup isOpen={isOpen} closeModal={onCloseModal}>
      <Flex center column>
        <Heading level={3} sx={{ my: 6 }}>It's a new week</Heading>
        <Box sx={{ px: 4, pb: 4 }}>
          <Box sx={{
            maxWidth: '370px',
            bg: 'whiteAlpha.5',
            borderRadius: 'default',
            p: 4, mb: 4,
            fontWeight: 'light',
            textAlign: 'center',
            lineHeight: 1.5,
          }}>
            <Text>
              Starting the timer will automatically begin tracking the week beginning on <b>{format(new Date(), 'EEEE, MMMM d')}</b>.
            </Text>
          </Box>
          <Button onClick={handleConfirmStart} sx={{ flex: 1, minWidth: '100%' }}>
            OK, start timer
          </Button>
        </Box>
      </Flex>
    </ModalPopup>
  )
}

export default TimerConfirmNewWeekModal