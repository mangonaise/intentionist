import { FC, useLayoutEffect, useRef, useState } from 'react'
import Flex from '@/components/primitives/Flex'
import useWindowWidth from '@/lib/hooks/useWindowWidth'

const CellEditorButtonsBar: FC<{ above?: boolean }> = ({ above, children }) => {
  const barRef = useRef<HTMLDivElement>(null)
  const windowWidth = useWindowWidth()
  const [anchor, setAnchor] = useState<'none' | 'left' | 'right'>('none')
  const [xOffset, setXOffset] = useState(0)
  const [yOffset, setYOffset] = useState(0)

  useLayoutEffect(() => {
    if (!barRef.current || !barRef.current.parentElement) return
    const cellLeftPos = barRef.current.parentElement.getBoundingClientRect().left
    const cellWidth = barRef.current.parentElement.offsetWidth
    const barWidth = barRef.current.offsetWidth
    const pagePadding = windowWidth > 600 ? 7 : 0
    const proposedXOffset = (cellWidth - barWidth) / 2

    if (above) {
      const cellHeight = barRef.current.parentElement.offsetHeight
      setYOffset(cellHeight)
    }

    if (cellLeftPos + proposedXOffset < pagePadding) {
      setAnchor('left')
    } else if (cellLeftPos + barWidth + proposedXOffset > windowWidth - pagePadding) {
      setAnchor('right')
    } else {
      setXOffset(proposedXOffset)
      setAnchor('none')
    }
  }, [windowWidth, above, children])

  return (
    <Flex
      center
      ref={barRef}
      sx={{
        zIndex: 1,
        position: 'fixed',
        flexWrap: anchor === 'none' ? 'nowrap' : 'wrap',
        left: anchor === 'left' ? [0, 2] : 'auto',
        right: anchor === 'right' ? [0, 2] : 'auto',
        pl: '4px', pt: '4px',
        bg: 'rgba(24, 24, 24, 0.88)',
        borderRadius: 'default',
        transform: `translateX(${anchor === 'none' ? xOffset : 0}px) translateY(${above ? `calc(${-yOffset}px - 3rem - 1px)` : 0})`
      }}
    >
      {children}
    </Flex>
  )
}

export default CellEditorButtonsBar