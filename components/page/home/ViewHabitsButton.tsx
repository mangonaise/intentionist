import IconButton from '@/components/primitives/IconButton'
import PencilIcon from '@/components/icons/PencilIcon'
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
          height: ['2.75rem', 'row'],
          padding: 0,
          paddingLeft: '0.9rem',
          borderRadius: 0,
          borderTop: 'solid 1px',
          borderBottom: [null, 'solid 1px'],
          borderColor: ['grid', 'grid'],
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