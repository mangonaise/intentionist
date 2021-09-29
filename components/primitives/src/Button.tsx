import styled from '@emotion/styled';
import { HTMLAttributes } from 'react';
import { border, BorderProps, color, ColorProps, flexbox, FlexboxProps, layout, LayoutProps, space, SpaceProps, typography, TypographyProps } from 'styled-system';
import theme from 'styles/theme';

interface CustomProps extends HTMLAttributes<HTMLButtonElement> { 
  bg?: string,
  reduceHoverOpacity?: boolean
}
type StyleProps = SpaceProps & FlexboxProps & LayoutProps & TypographyProps & ColorProps & BorderProps
export type ButtonProps = StyleProps & CustomProps

const custom = ({ bg, reduceHoverOpacity }: CustomProps) => ({
  backgroundColor: bg || theme.colors.button,
  '&:hover': {
    backgroundColor: bg || theme.colors.buttonHighlight,
    opacity: reduceHoverOpacity ? 0.9 : 1
  }
})

const Button = styled.button<ButtonProps>({
  cursor: 'pointer',
  userSelect: 'none',
  padding: '0.7rem 1rem',
  border: 'none',
  color: 'inherit',
  fontSize: 'inherit',
  fontFamily: 'inherit',
  fontWeight: 450,
  borderRadius: theme.radii.default,
  backgroundColor: theme.colors.button,
}, custom, space, layout, flexbox, typography, color, border)

export default Button