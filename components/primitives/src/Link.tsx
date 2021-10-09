import { forwardRef, HTMLProps, PropsWithChildren } from 'react'

type LinkProps = HTMLProps<HTMLAnchorElement>

const Link = forwardRef<HTMLAnchorElement, PropsWithChildren<LinkProps>>(function Link(props, ref) {
  return (
    <a
      sx={{
        margin: 0,
        cursor: 'pointer',
        color: 'inherit',
        textDecoration: 'none',
        '&:hover': {
          textDecoration: 'underline 2px hsla(0, 0%, 100%, 0.2)'
        }
      }}
      ref={ref}
      {...props}
    >
      {props.children}
    </a>
  )
})

export default Link