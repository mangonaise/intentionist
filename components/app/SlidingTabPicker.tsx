import { useState } from 'react'
import Flex from '@/components/primitives/Flex'
import Button from '@/components/primitives/Button'
import IconButton from '@/components/primitives/IconButton'

interface Props {
  data: Array<{
    text: string | JSX.Element,
    color: string,
    icon: (() => JSX.Element) | null,
    onClick: () => void
  }>
  hideText?: boolean
  activeIndex: number
}

const SlidingTabPicker = ({ data, hideText, activeIndex }: Props) => {
  const [bottomBorderOffsets] = useState(data.map((_, index) => `calc(100% / ${data.length} * ${index})`))
  const [bottomBorderWidth] = useState(`calc(100% / ${data.length})`)

  return (
    <Flex
      sx={{
        position: 'relative',
        borderBottom: 'solid 2px transparent',
        '&::after': {
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          left: bottomBorderOffsets[activeIndex],
          width: bottomBorderWidth,
          bottom: '-2px',
          content: '""',
          borderBottom: 'solid 2px',
          borderBottomColor: data[activeIndex].color ?? 'text',
          transition: 'border-color 300ms, left 300ms cubic-bezier(0, 0, 0.15, 1.0)'
        }
      }}
    >
      {data.map((data, index) => {
        const isSelected = index === activeIndex
        const Component = data.icon ? IconButton : Button
        return (
          <Component
            {...(data.icon ? { icon: data.icon } : {} as { icon: () => JSX.Element })}
            onClick={data.onClick}
            hoverEffect="none"
            sx={{
              flex: 1,
              position: 'relative',
              paddingBottom: 3,
              paddingTop: 2,
              color: isSelected ? data.color : 'text',
              filter: 'brightness(1.5)',
              backgroundColor: 'transparent',
              borderBottom: 'solid 2px transparent',
              borderRadius: 0,
              fontWeight: 'medium',
              transition: `color 350ms`,
              '&::after': {
                position: 'absolute',
                inset: 0,
                content: '""',
                bottom: '-4px',
                borderBottom: 'solid 2px',
                borderColor: isSelected ? 'whiteAlpha.25' : 'whiteAlpha.10',
                transition: 'border-color 150ms'
              },
              '&:hover::after': {
                borderColor: isSelected ? null : 'whiteAlpha.25'
              }
            }}
            key={index}
          >
            {!hideText && data.text}
          </Component>
        )
      })}
    </Flex>
  )
}

export default SlidingTabPicker