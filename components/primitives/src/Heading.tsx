import { StyledComponent } from '@/components/types/StyledComponent'

interface Props {
  level?: 1 | 2 | 3 | 4 | 5 | 6
}

const Heading: StyledComponent<Props> = (props) => {
  const HeadingLevel = `h${props.level ?? 2}` as keyof JSX.IntrinsicElements
  return (
    <HeadingLevel
      sx={{
        fontWeight: 'semibold',
        fontSize: '1.5rem'
      }}
      className={props.className}
    >
      {props.children}
    </HeadingLevel>
  )
}

export default Heading