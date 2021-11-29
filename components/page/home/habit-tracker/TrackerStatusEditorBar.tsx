import { FC, useLayoutEffect, useRef, useState } from 'react'
import Flex from '@/components/primitives/Flex'
import useWindowWidth from '@/hooks/useWindowWidth'

const TrackerStatusEditorBar: FC<{ above?: boolean }> = ({ above, children }) => {
  const barRef = useRef<HTMLDivElement>(null)
  const windowWidth = useWindowWidth()
  const [anchor, setAnchor] = useState<'none' | 'left' | 'right'>('none')
  const [translateX, setTranslateX] = useState('0')
  const [translateY, setTranslateY] = useState('0')
  const [scrollOffset, setScrollOffset] = useState(0)

  useLayoutEffect(() => {
    if (!barRef.current || !barRef.current.parentElement) return
    const cellLeftPos = barRef.current.parentElement.getBoundingClientRect().left
    const cellWidth = barRef.current.parentElement.offsetWidth
    const cellHeight = barRef.current.parentElement.offsetHeight
    const barWidth = barRef.current.offsetWidth
    const pagePadding = windowWidth > 600 ? 7 : 0
    const proposedXOffset = (cellWidth - barWidth) / 2

    if (above) {
      setTranslateY(`calc(-3rem - 1px)`)
    } else {
      setTranslateY(`${cellHeight}px`)
    }

    if (cellLeftPos + proposedXOffset < pagePadding) {
      setAnchor('left')
    } else if (cellLeftPos + barWidth + proposedXOffset > windowWidth - pagePadding) {
      setAnchor('right')
    } else {
      setTranslateX(`${proposedXOffset}px`)
      setAnchor('none')
    }
  }, [windowWidth, above, children])

  useLayoutEffect(() => {
    function handleScroll() {
      setScrollOffset(document.documentElement.scrollTop)
    }
    handleScroll()
    document.addEventListener('scroll', handleScroll)
    return () => document.removeEventListener('scroll', handleScroll)
  }, [])

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
        borderRadius: 'trackerStatus',
        transform: `translateX(${translateX}) translateY(calc(${translateY} - ${scrollOffset}px))`
      }}
    >
      {children}
    </Flex>
  )
}

export default TrackerStatusEditorBar