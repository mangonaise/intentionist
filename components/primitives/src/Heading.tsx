import styled from '@emotion/styled';
import { color, ColorProps, space, SpaceProps, typography, TypographyProps } from 'styled-system';

type StyleProps = SpaceProps & ColorProps & TypographyProps

const Heading = styled.h2<StyleProps>({
  margin: 0,
}, space, color, typography)

export default Heading