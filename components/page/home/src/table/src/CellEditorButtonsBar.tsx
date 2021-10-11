import { FC, useLayoutEffect, useRef, useState } from 'react'
import { Flex } from '@/components/primitives'
import useWindowWidth from '@/lib/hooks/useWindowWidth'

const CellEditorButtonsBar: FC<{ above?: boolean }> = ({ above, children }) => {
  const barRef = useRef<HTMLDivElement>(null)
  const windowWidth = useWindowWidth()
  const [anchor, setAnchor] = useState<'none' | 'left' | 'right'>('none')
  const [xOffset, setXOffset] = useState(0)
  const [bottom, setBottom] = useState('auto')

  useLayoutEffect(() => {
    if (!barRef.current || !barRef.current.parentElement) return
    const cellLeftPos = barRef.current.parentElement.getBoundingClientRect().left
    const cellWidth = barRef.current.parentElement.offsetWidth
    const barWidth = barRef.current.offsetWidth
    const pagePadding = windowWidth > 600 ? 14 : 0
    const proposedXOffset = (cellWidth - barWidth) / 2

    if (above) {
      const cellHeight = barRef.current.parentElement.offsetHeight
      setBottom(`calc(${cellHeight}px)`)
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
        position: 'absolute',
        flexWrap: anchor === 'none' ? 'nowrap' : 'wrap',
        left: anchor === 'left' ? [0, 4] : 'auto',
        right: anchor === 'right' ? [0, 4] : 'auto',
        bottom: bottom,
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