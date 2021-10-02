import { ReactNode, useRef } from 'react'
import { Box } from '@/components/primitives'
import { BoxProps } from '@/components/primitives/src/Box'

interface Props extends BoxProps {
  blurAction: () => void,
  children: ReactNode
}

const BlurListener = ({ blurAction, children, ...props }: Props) => {
  const elementRef = useRef<HTMLDivElement>(null)

  async function handleFocusChange() {
    await new Promise(resolve => setTimeout(resolve, 0))
    const focusedElement = document.activeElement
    if (focusedElement instanceof HTMLElement) {
      if (elementRef.current && !elementRef.current.contains(focusedElement)) {
        blurAction()
      }
    }
  }

  return (
    <Box onBlur={handleFocusChange} ref={elementRef} {...props}>
      {children}
    </Box>
  )
}

export default BlurListener