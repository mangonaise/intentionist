import Box from '@/components/primitives/Box'
import { StyledComponent } from '@/components/types/StyledComponent'

interface Props {
  color?: string
}

const Divider: StyledComponent<Props> = ({ color, className }) => {
  return (
    <Box
      role="presentation"
      sx={{ borderTop: 'solid 1px', borderColor: color ?? 'divider' }}
      className={className}
    />
  )
}

export default Divider