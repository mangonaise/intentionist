import styled from '@emotion/styled'
import css from '@styled-system/css'
import { space, SpaceProps, typography, TypographyProps } from 'styled-system'

type StyleProps = SpaceProps & TypographyProps

const Input = styled.input<StyleProps>(css({
  width: '100%',
  padding: '0.6rem 0.8rem',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  color: 'text',
  background: 'rgba(255, 255, 255, 0.02)',
  border: 'solid 2px rgba(255, 255, 255, 0.25)',
  borderRadius: 'default'
}), space, typography)

export default Input