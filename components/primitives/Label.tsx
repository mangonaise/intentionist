import { StyledComponent } from '@/components/types/StyledComponent'
import { ComponentPropsWithoutRef } from 'react'

const Label: StyledComponent<ComponentPropsWithoutRef<'label'>> = (props) => (
  <label {...props}>
    {props.children}
  </label>
)

export default Label