import { PencilIcon } from '@/components/icons'
import { IconButton } from '@/components/primitives'
import NextLink from 'next/link'
import styled from '@emotion/styled'
import css from '@styled-system/css'

const ViewHabitsButton = () => {
  return (
    <NextLink href="/habits">
      <StyledButton icon={PencilIcon} flexStart>
        Add or edit habits
      </StyledButton>
    </NextLink>
  )
}

const StyledButton = styled(IconButton)(css({
  gridColumn: '1 / -1',
  width: '100%',
  height: 'row',
  padding: 0,
  paddingLeft: '0.9rem',
  borderRadius: 0,
  borderBottom: 'solid 1px',
  borderColor: 'grid',
  backgroundColor: 'transparent',
  color: 'whiteAlpha.60',
  '& svg': {
    color: 'text',
    opacity: 0.6
  },
  '&:hover': {
    color: 'text',
    backgroundColor: 'whiteAlpha.5',
    '& svg': {
      opacity: 1
    },
  }
}))

export default ViewHabitsButton