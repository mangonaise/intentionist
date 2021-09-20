import styled from '@emotion/styled'
import { border, BorderProps, color, ColorProps, flexbox, FlexboxProps, layout, LayoutProps, position, PositionProps, space, SpaceProps } from 'styled-system'

type StyleProps = PositionProps  & SpaceProps & LayoutProps & FlexboxProps & ColorProps & BorderProps
const Box = styled.div<StyleProps>(position, space, layout, flexbox, color, border)

export default Box