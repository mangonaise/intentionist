import styled from '@emotion/styled';
import { border, BorderProps, color, ColorProps, flexbox, FlexboxProps, space, SpaceProps, typography, TypographyProps } from 'styled-system';
import theme from 'styles/theme';

interface ButtonProps { bg?: string }
type StyleProps = ButtonProps & SpaceProps & FlexboxProps & TypographyProps & ColorProps & BorderProps

const background = ({ bg }: ButtonProps) => ({
  backgroundColor: bg || theme.colors.button,
  '&:hover': {
    backgroundColor: bg || theme.colors.buttonHighlight
  }
})

const Button = styled.button<StyleProps>({
  cursor: 'pointer',
  padding: '0.7rem 1rem',
  fontSize: 'inherit',
  fontFamily: 'inherit',
  color: 'inherit',
  border: 'none',
  borderRadius: theme.radii.default,
  backgroundColor: theme.colors.button,
}, background, space, flexbox, typography, color, border)

export default Button