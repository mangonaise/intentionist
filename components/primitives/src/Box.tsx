import styled from '@emotion/styled'
import { HTMLAttributes } from 'react'
import { background, BackgroundProps, border, BorderProps, color, ColorProps, flexbox, FlexboxProps, layout, LayoutProps, position, PositionProps, space, SpaceProps } from 'styled-system'

type DivProps = HTMLAttributes<HTMLDivElement>
type StyleProps = PositionProps  & SpaceProps & LayoutProps & FlexboxProps & ColorProps & BorderProps & BackgroundProps
export type BoxProps = DivProps & StyleProps
const Box = styled.div<StyleProps>(position, space, layout, flexbox, color, border, background)

export default Box