import styled from '@emotion/styled';
import { color, ColorProps, space, SpaceProps, typography, TypographyProps } from 'styled-system';

type StyleProps = SpaceProps & TypographyProps & ColorProps

const Label = styled.label<StyleProps>(space, typography, color)

export default Label