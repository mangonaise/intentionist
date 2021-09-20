import styled from '@emotion/styled';
import { HTMLAttributes } from 'react';
import { border, BorderProps, color, ColorProps, flexbox, FlexboxProps, space, SpaceProps, typography, TypographyProps } from 'styled-system';
import theme from 'styles/theme';

interface CustomProps extends HTMLAttributes<HTMLButtonElement> { 
  bg?: string 
}
type StyleProps = SpaceProps & FlexboxProps & TypographyProps & ColorProps & BorderProps
export type ButtonProps = StyleProps & CustomProps

const background = ({ bg }: CustomProps) => ({
  backgroundColor: bg || theme.colors.button,
  '&:hover': {
    backgroundColor: bg || theme.colors.buttonHighlight
  }
})

const Button = styled.button<ButtonProps>({
  cursor: 'pointer',
  padding: '0.7rem 1rem',
  border: 'none',
  color: 'inherit',
  fontSize: 'inherit',
  fontFamily: 'inherit',
  fontWeight: 450,
  borderRadius: theme.radii.default,
  backgroundColor: theme.colors.button,
}, background, space, flexbox, typography, color, border)

export default Button