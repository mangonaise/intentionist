import { ComponentPropsWithoutRef, forwardRef, PropsWithChildren } from 'react'
import exclude from '@/logic/utils/exclude'

export interface CustomButtonProps {
  hoverEffect?: 'default' | 'none' | 'opacity'
}

export interface ButtonProps extends ComponentPropsWithoutRef<'button'>, CustomButtonProps {}

const Button = forwardRef<HTMLButtonElement, PropsWithChildren<ButtonProps>>(function Button(props, ref) {
  const hoverEffect = props.hoverEffect ?? 'default'

  return (
    <button
      sx={{
        cursor: 'pointer',
        userSelect: 'none',
        minHeight: '2.5rem',
        margin: 0,
        paddingX: '1rem',
        border: 'none',
        color: 'inherit',
        fontSize: 'inherit',
        fontFamily: 'inherit',
        fontWeight: 450,
        lineHeight: '1rem',
        borderRadius: 'default',
        backgroundColor: 'button',
        '&:hover': {
          backgroundColor: hoverEffect === 'default' ? 'buttonHighlight' : undefined,
          opacity: hoverEffect === 'opacity' ? 0.85 : undefined
        },
        '&:disabled': {
          opacity: 0.3,
          cursor: 'default',
          pointerEvents: 'none'
        }
      }}
      ref={ref}
      type={props.type}
      {...exclude(props, 'hoverEffect')}
    >
      {props.children}
    </button>
  )
})

export default Button