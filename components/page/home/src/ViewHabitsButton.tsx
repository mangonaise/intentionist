import { PencilIcon } from '@/components/icons'
import { IconButton } from '@/components/primitives'
import NextLink from 'next/link'

const ViewHabitsButton = () => {
  return (
    <NextLink href="/habits">
      <IconButton
        icon={PencilIcon}
        sx={{
          justifyContent: 'flex-start',
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
        }}
      >
        Add or edit habits
      </IconButton>
    </NextLink>
  )
}

export default ViewHabitsButton