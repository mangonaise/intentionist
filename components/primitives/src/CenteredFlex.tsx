import styled from '@emotion/styled'
import { flex } from 'styled-system'
import Flex from './Flex'

interface OverrideProps {
  flexStart?: boolean
}

const CenteredFlex = styled(Flex)<OverrideProps>(({ flexStart }: OverrideProps) => ({
  justifyContent: flexStart ? 'flex-start' : 'center',
  alignItems: 'center'
}), flex)

export default CenteredFlex