import { StyledComponent } from '@/components/types/StyledComponent'
import { HTMLProps } from 'react'

const Form: StyledComponent<HTMLProps<HTMLFormElement>> = (props) => (
  <form {...props}>
    {props.children}
  </form>
)

export default Form