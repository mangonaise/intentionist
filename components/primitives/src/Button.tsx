import styled from '@emotion/styled'
import css from '@styled-system/css'
import { HTMLAttributes } from 'react'
import { border, BorderProps, color, ColorProps, flexbox, FlexboxProps, layout, LayoutProps, space, SpaceProps, typography, TypographyProps } from 'styled-system'

interface CustomProps extends HTMLAttributes<HTMLButtonElement> {
  bg?: string,
  reduceHoverOpacity?: boolean
}
type StyleProps = SpaceProps & FlexboxProps & LayoutProps & TypographyProps & ColorProps & BorderProps
export type ButtonProps = StyleProps & CustomProps

const Button = styled.button<ButtonProps>(({ bg, reduceHoverOpacity }: ButtonProps) => (css({
  cursor: 'pointer',
  userSelect: 'none',
  padding: '0.7rem 1rem',
  border: 'none',
  color: 'inherit',
  fontSize: 'inherit',
  fontFamily: 'inherit',
  fontWeight: 450,
  borderRadius: 'default',
  backgroundColor: bg || 'button',
  '&:hover': {
    backgroundColor: bg || 'buttonHighlight',
    opacity: reduceHoverOpacity ? 0.9 : 1
  },
  '&:disabled': {
    opacity: 0.3,
    cursor: 'default'
  }
})), space, layout, flexbox, typography, color, border)

export default Button