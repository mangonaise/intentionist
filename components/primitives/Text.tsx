import styled from '@emotion/styled';
import { typography, TypographyProps } from 'styled-system';

type StyleProps = TypographyProps

const Text = styled.p<StyleProps>({
  margin: 0
}, typography)

export default Text