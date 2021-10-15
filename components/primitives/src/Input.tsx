import { StyledComponent } from '@/components/types/StyledComponent'
import { ComponentPropsWithoutRef } from 'react'

const Input: StyledComponent<ComponentPropsWithoutRef<'input'>> = (props) => (
  <input
    type="text"
    sx={{
      width: '100%',
      padding: '0.6rem 0.8rem',
      fontFamily: 'inherit',
      fontSize: 'inherit',
      color: 'text',
      background: 'rgba(255, 255, 255, 0.02)',
      border: 'solid 2px rgba(255, 255, 255, 0.25)',
      borderRadius: 'default',
      '&:focus': {
        boxShadow: 'none',
        borderColor: 'whiteAlpha.60'
      }
    }}
    {...props}
  />
)

export default Input