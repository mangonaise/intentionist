import styled from '@emotion/styled';
import { HTMLAttributes } from 'react';
import { color, ColorProps, flexbox, FlexboxProps, layout, LayoutProps, space, SpaceProps, typography, TypographyProps } from 'styled-system';
import theme from 'styles/theme';

interface CustomProps extends HTMLAttributes<HTMLButtonElement> { 
  bg?: string,
  reduceHoverOpacity?: boolean
}
type StyleProps = SpaceProps & FlexboxProps & LayoutProps & TypographyProps & ColorProps
export type ButtonProps = StyleProps & CustomProps

const Button = styled.button<ButtonProps>(({ bg, reduceHoverOpacity }: ButtonProps) => ({
  cursor: 'pointer',
  userSelect: 'none',
  padding: '0.7rem 1rem',
  border: 'none',
  color: 'inherit',
  fontSize: 'inherit',
  fontFamily: 'inherit',
  fontWeight: 450,
  borderRadius: theme.radii.default,
  backgroundColor: bg || theme.colors.button,
  '&:hover': {
    backgroundColor: bg || theme.colors.buttonHighlight,
    opacity: reduceHoverOpacity ? 0.9 : 1
  },
  '&:disabled': {
    opacity: 0.3,
    cursor: 'default'
  }
}), space, layout, flexbox, typography, color)

export default Button