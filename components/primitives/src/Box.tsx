import { ComponentPropsWithoutRef, forwardRef, PropsWithChildren } from 'react'

export type BoxProps = ComponentPropsWithoutRef<'div'>

const Box = forwardRef<HTMLDivElement, PropsWithChildren<BoxProps>>(function Box(props, ref) {
  return (
    <div ref={ref} {...props}>{props.children}</div>
  )
})

export default Box