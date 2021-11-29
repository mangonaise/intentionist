import { StyledComponent } from '@/components/types/StyledComponent'
import { ComponentPropsWithoutRef } from 'react'

interface CheckboxProps extends ComponentPropsWithoutRef<'input'> {
  label: string
}

const Checkbox: StyledComponent<CheckboxProps> = (props) => {
  const { label, checked } = props


  return (
    <label
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: 'fit-content',
        color: checked ? 'text' : 'whiteAlpha.70',
        '&:hover input:not(:checked)': {
          backgroundColor: 'whiteAlpha.30',
        }
      }}
    >
      <input
        type="checkbox"
        sx={{
          position: 'relative',
          margin: 0,
          marginRight: 2,
          height: '1.15em',
          minWidth: '1.15em',
          appearance: 'none',
          border: 'solid 2px',
          borderColor: 'text',
          borderRadius: 'default',
          transition: 'background-color 150ms',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: '15%',
            size: '70%',
            clipPath: 'polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%)',
            backgroundColor: 'bg',
            opacity: 0,
            transition: 'opacity 150ms'
          },
          '&:checked': {
            backgroundColor: 'text',
            '&::before': {
              opacity: 1
            }
          }
        }}
        {...props}
      />
      {label}
    </label>
  )
}

export default Checkbox