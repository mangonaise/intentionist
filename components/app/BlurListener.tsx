import { useRef } from 'react'
import { StyledComponent } from '@/components/types/StyledComponent'

interface Props {
  blurAction: () => void,
  escapeAction?: () => void
}

const BlurListener: StyledComponent<Props> = (props) => {
  const { blurAction, escapeAction, children } = props
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
    <div
      ref={elementRef}
      onBlur={handleFocusChange}
      onKeyDown={(e) => e.key === 'Escape' && escapeAction?.()}
      className={props.className}
    >
      {children}
    </div>
  )
}

export default BlurListener