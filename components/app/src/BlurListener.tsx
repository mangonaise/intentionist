import { useRef } from 'react'
import { StyledComponent } from '@/components/types/StyledComponent'

interface Props {
  blurAction: () => void,
}

const BlurListener: StyledComponent<Props> = (props) => {
  const { blurAction, children } = props
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
    <div onBlur={handleFocusChange} ref={elementRef} className={props.className}>
      {children}
    </div>
  )
}

export default BlurListener