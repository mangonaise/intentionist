import styled from '@emotion/styled';
import { space, SpaceProps, typography, TypographyProps } from 'styled-system';
import theme from 'styles/theme';

type StyleProps = SpaceProps & TypographyProps

const Input = styled.input<StyleProps>({
  padding: '0.6rem 0.8rem',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  color: theme.colors.text,
  background: 'rgba(255, 255, 255, 0.02)',
  border: 'solid 2px rgba(255, 255, 255, 0.25)',
  borderRadius: theme.radii.default
}, space, typography)

export default Input