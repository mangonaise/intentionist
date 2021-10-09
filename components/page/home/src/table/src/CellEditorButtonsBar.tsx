import { FC, useLayoutEffect, useRef, useState } from 'react'
import { Flex } from '@/components/primitives'
import useWindowWidth from '@/lib/hooks/useWindowWidth'

const CellEditorButtonsBar: FC<{ above?: boolean }> = ({ above, children }) => {
  const barRef = useRef<HTMLDivElement>(null)
  const windowWidth = useWindowWidth()
  const [anchor, setAnchor] = useState<'none' | 'left' | 'right'>('none')
  const [xOffset, setXOffset] = useState(0)
  const [top, setTop] = useState('auto')

  useLayoutEffect(() => {
    if (!barRef.current || !barRef.current.parentElement) return
    const cellLeftPos = barRef.current.parentElement.getBoundingClientRect().left || 0
    const cellWidth = barRef.current.parentElement.offsetWidth || 0
    const barWidth = barRef.current.offsetWidth
    const pagePadding = windowWidth > 600 ? 14 : 0
    const proposedXOffset = (cellWidth - barWidth) / 2

    if (above) {
      const cellTop = barRef.current.parentElement.getBoundingClientRect().top || 0
      setTop(`calc(${cellTop}px - 8px - 2.5rem)`)
    }

    if (cellLeftPos + proposedXOffset < pagePadding) {
      setAnchor('left')
    } else if (cellLeftPos + barWidth + proposedXOffset > windowWidth - pagePadding) {
      setAnchor('right')
    } else {
      setXOffset(proposedXOffset)
      setAnchor('none')
    }
  }, [windowWidth, above])

  return (
    <Flex
      center
      ref={barRef}
      sx={{
        zIndex: 1,
        position: 'fixed',
        flexWrap: anchor === 'none' ? 'nowrap' : 'wrap',
        left: anchor === 'left' ? [0, 4] : 'auto',
        right: anchor === 'right' ? [0, 4] : 'auto',
        top: top,
        pl: '4px', pt: '4px',
        bg: 'rgba(24, 24, 24, 0.88)',
        borderRadius: 'default',
        transform: `translateX(${anchor === 'none' ? xOffset : 0}px)`
      }}
    >
      {children}
    </Flex>
  )
}

export default CellEditorButtonsBar