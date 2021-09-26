import styled from '@emotion/styled'
import { HTMLAttributes } from 'react'
import { color, ColorProps, space, SpaceProps, typography, TypographyProps } from 'styled-system'

interface CustomProps extends HTMLAttributes<HTMLDivElement> {
  icon: () => JSX.Element
}
type StyleProps = SpaceProps & ColorProps & TypographyProps
type IconProps = CustomProps & StyleProps

const IconWrapper = styled.div<StyleProps>({
  display: 'inline-flex',
  verticalAlign: 'bottom'
}, space, color, typography)

const Icon = ({ icon, ...props }: IconProps) => {
  const IconComponent = icon
  return (
    <IconWrapper {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em">
        <IconComponent />
      </svg>
    </IconWrapper>
  )
}

export default Icon