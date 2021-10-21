import { StyledComponent } from '@/components/types/StyledComponent'
import { ComponentPropsWithoutRef } from 'react'

const Form: StyledComponent<ComponentPropsWithoutRef<'form'>> = (props) => (
  <form {...props}>
    {props.children}
  </form>
)

export default Form