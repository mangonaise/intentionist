import styled from '@emotion/styled'
import { color, ColorProps, space, SpaceProps, typography, TypographyProps } from 'styled-system'

type StyleProps = SpaceProps & ColorProps & TypographyProps

const Text = styled.p<StyleProps>({
  margin: 0
}, space, color, typography)

export default Text