import { forwardRef, HTMLProps, PropsWithChildren } from 'react'

export type BoxProps = HTMLProps<HTMLDivElement>

const Box = forwardRef<HTMLDivElement, PropsWithChildren<BoxProps>>(function Box(props, ref) {
  return (
    <div ref={ref} {...props}>{props.children}</div>
  )
})

export default Box