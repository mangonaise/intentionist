import styled from '@emotion/styled';
import { grid, GridProps } from 'styled-system';

type StyleProps = GridProps

const Grid = styled.div<StyleProps>(grid)

export default Grid