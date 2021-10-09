import { StyledComponent } from '@/components/types/StyledComponent'
import { HTMLProps } from 'react'

const Input: StyledComponent<HTMLProps<HTMLInputElement>> = (props) => (
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
      borderRadius: 'default'
    }}
    {...props}
  />
)

export default Input