import { forwardRef, PropsWithChildren } from 'react'
import { BoxProps } from './Box'

interface FlexProps extends BoxProps {
  center?: boolean,
  column?: boolean,
  flexWrap?: boolean,
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'
  align?: 'stretch' | 'center' | 'flex-start' | 'flex-end' | 'baseline'
}

const Flex = forwardRef<HTMLDivElement, PropsWithChildren<FlexProps>>(function Flex(props, ref) {
  const { center, column, flexWrap, justify, align } = props

  return (
    <div
      sx={{
        display: 'flex',
        flexDirection: column ? 'column' : undefined,
        flexWrap: flexWrap ? 'wrap' : undefined,
        justifyContent: justify ?? (center ? 'center' : undefined),
        alignItems: align ?? (center ? 'center' : undefined)
      }}
      ref={ref}
      className={props.className}
      style={props.style}
    >
      {props.children}
    </div>
  )
})

export default Flex