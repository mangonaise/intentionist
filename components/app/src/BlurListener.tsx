import { ReactNode, useRef } from 'react'

interface Props {
  onBlur: () => void,
  children: ReactNode
}

const BlurListener = ({ onBlur, children }: Props) => {
  const elementRef = useRef<HTMLDivElement>(null)

  async function handleFocusChange() {
    await new Promise(resolve => setTimeout(resolve, 0))
    const focusedElement = document.activeElement
    if (focusedElement instanceof HTMLElement) {
      if (!elementRef.current!.contains(focusedElement)) {
        onBlur()
      }
    }
  }

  return (
    <div onBlur={handleFocusChange} ref={elementRef}>
      {children}
    </div>
  )
}

export default BlurListener