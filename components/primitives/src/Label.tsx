import { StyledComponent } from '@/components/types/StyledComponent'
import { HTMLProps } from 'react'

const Label: StyledComponent<HTMLProps<HTMLLabelElement>> = (props) => (
  <label {...props}>
    {props.children}
  </label>
)
export default Label