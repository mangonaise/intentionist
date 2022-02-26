import { StyledComponent } from '@/components/types/StyledComponent'

interface Props {
  type?: 'p' | 'span' | 'div'
}

const Text: StyledComponent<Props> = (props) => {
  const Component = props.type ?? 'p'
  return (
    <Component
      sx={{
        margin: 0,
        '& b': {
          fontWeight: 'semibold'
        }
      }}
      className={props.className}
    >
      {props.children}
    </Component>
  )
}

export default Text