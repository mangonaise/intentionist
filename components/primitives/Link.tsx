import styled from '@emotion/styled';
import { typography, TypographyProps } from 'styled-system';

type StyleProps = TypographyProps

const Link = styled.a<StyleProps>({
  margin: 0,
  cursor: 'pointer',
  '&:hover': {
    textDecoration: 'underline 2px hsla(0, 0%, 100%, 0.2)'
  }
}, typography)

export default Link