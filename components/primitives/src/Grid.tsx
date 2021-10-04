import styled from '@emotion/styled';
import { grid, GridProps } from 'styled-system';
import { Box } from '..';
import { BoxProps } from './Box';

type StyleProps = GridProps & BoxProps

const Grid = styled(Box)<StyleProps>({
  display: 'grid'
}, grid)

export default Grid