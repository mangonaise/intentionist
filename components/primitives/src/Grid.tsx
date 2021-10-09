import { StyledComponent } from '@/components/types/StyledComponent'

const Grid: StyledComponent = (props) => (
  <div
    sx={{ display: 'grid' }}
    className={props.className}
  >
    {props.children}
  </div>
)

export default Grid