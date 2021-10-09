import { forwardRef, HTMLProps, PropsWithChildren } from 'react'
import exclude from '@/lib/logic/utils/exclude'

export interface ButtonProps extends HTMLProps<HTMLButtonElement> {
  hoverEffect?: 'default' | 'none' | 'opacity'
}

const Button = forwardRef<HTMLButtonElement, PropsWithChildren<ButtonProps>>(function Button (props, ref) {
  const hoverEffect = props.hoverEffect ?? 'default'

  return (
    <button
      sx={{
        cursor: 'pointer',
        userSelect: 'none',
        padding: '0.7rem 1rem',
        border: 'none',
        color: 'inherit',
        fontSize: 'inherit',
        fontFamily: 'inherit',
        fontWeight: 450,
        borderRadius: 'default',
        backgroundColor: 'button',
        '&:hover': {
          backgroundColor: hoverEffect === 'default' ? 'buttonHighlight' : undefined,
          opacity: hoverEffect === 'opacity' ? 0.9 : undefined
        },
        '&:disabled': {
          opacity: 0.3,
          cursor: 'default'
        }
      }}
      ref={ref}
      type={props.type as any}
      {...exclude(props, 'hoverEffect')}
    >
      {props.children}
    </button>
  )
})

export default Button