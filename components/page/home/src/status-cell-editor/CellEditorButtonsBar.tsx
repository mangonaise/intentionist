import { CenteredFlex } from '@/components/primitives'
import { FC, useLayoutEffect, useRef, useState } from 'react'

const CellEditorButtonsBar: FC<{ above?: boolean }> = ({ above, children }) => {
  const barRef = useRef<HTMLDivElement>(null)
  const [windowWidth] = useState(window.innerWidth)
  const [anchor, setAnchor] = useState<'none' | 'left' | 'right'>('none')
  const [xOffset, setXOffset] = useState(0)
  const [top, setTop] = useState('auto')

  useLayoutEffect(() => {
    if (!barRef.current || !barRef.current.parentElement) return
    const cellLeftPos = barRef.current.parentElement.getBoundingClientRect().left || 0
    const cellWidth = barRef.current.parentElement.offsetWidth || 0
    const barWidth = barRef.current.offsetWidth
    const proposedXOffset = (cellWidth - barWidth) / 2

    if (above) {
      const cellTop = barRef.current.parentElement.getBoundingClientRect().top || 0
      setTop(`calc(${cellTop}px - 8px - 2.5rem)`)
    }

    if (cellLeftPos + proposedXOffset < 14) {
      setAnchor('left')
    } else if (cellLeftPos + barWidth + proposedXOffset > windowWidth - 14) {
      setAnchor('right')
    } else {
      setXOffset(proposedXOffset)
      setAnchor('none')
    }
  }, [])

  return (
    <CenteredFlex
      ref={barRef}
      zIndex={1}
      position={'fixed'}
      flexWrap={anchor === 'none' ? 'nowrap' : 'wrap'}
      left={anchor === 'left' ? [0, 4] : 'auto'}
      right={anchor === 'right' ? [0, 4] : 'auto'}
      top={top}
      pl="4px"
      pt="4px"
      bg="rgba(18, 18, 18, 0.88)"
      borderRadius="default"
      style={{ transform: `translateX(${anchor === 'none' ? xOffset : 0}px)` }}
    >
      {children}
    </CenteredFlex>
  )
}

export default CellEditorButtonsBar