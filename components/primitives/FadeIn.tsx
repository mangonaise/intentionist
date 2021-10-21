import { StyledComponent } from '@/components/types/StyledComponent'

interface Props {
  time?: number,
  delay?: number
}

const FadeIn: StyledComponent<Props> = ({ time = 300, delay = 0, ...props }) => (
  <div
    sx={{
        opacity: time ? 0 : 1,
        animation: `fade-in forwards ${time}ms ${delay}ms`
      }}
    className={props.className}
  >
    {props.children}
  </div>
)

export default FadeIn