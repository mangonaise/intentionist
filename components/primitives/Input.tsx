import { ComponentPropsWithRef, forwardRef } from 'react'

const Input = forwardRef<HTMLInputElement, ComponentPropsWithRef<'input'>>(function Input(props, ref) {
  return (
    <input
      type="text"
      ref={ref}
      sx={{
        width: '100%',
        margin: 0,
        padding: '0.6rem 0.8rem',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        color: 'text',
        background: 'rgba(255, 255, 255, 0.03)',
        border: 'none',
        borderBottom: 'solid 2px',
        borderColor: 'whiteAlpha.30',
        transition: 'border-color 150ms',
        '&:focus': {
          boxShadow: 'none',
          borderColor: 'whiteAlpha.80'
        }
      }}
      {...props}
    />
  )
})

export default Input