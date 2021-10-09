import { forwardRef, HTMLProps, PropsWithChildren } from 'react'

export type BoxProps = HTMLProps<HTMLDivElement>

const Box = forwardRef<HTMLDivElement, PropsWithChildren<BoxProps>>((props, ref) => (
  <div ref={ref} {...props}>{props.children}</div>
))

Box.displayName = 'Box'

export default Box