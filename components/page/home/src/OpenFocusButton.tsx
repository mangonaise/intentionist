import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { ArrowRightIcon } from '@/components/icons'
import { Box, IconButton } from '@/components/primitives'
import WeekHandler from '@/lib/logic/app/WeekHandler'
import NextLink from 'next/link'

const OpenFocusButton = () => {
  const { viewMode } = container.resolve(WeekHandler)

  if (viewMode !== 'focus') return null

  return (
    <Box
      sx={{
        ml: [0, 3],
        mt: [3, 0],
        flex: [null, 1],
        width: ['100%', 'auto'],
        opacity: 0,
        animation: 'fade-in forwards 400ms 150ms',
      }}
    >
      <NextLink href="/focus">
        <IconButton
          right
          icon={ArrowRightIcon}
          hoverEffect="opacity"
          sx={{
            position: 'relative',
            width: '100%',
            backgroundColor: 'transparent',
            color: 'focus',
            fontWeight: 'semibold',
            filter: 'brightness(1.325)',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              border: 'solid 2px',
              borderColor: 'focus',
              opacity: 0.6
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              backgroundColor: 'focus',
              opacity: 0.1
            }
          }}
        >
          Open Focus
        </IconButton>
      </NextLink>
    </Box>
  )
}

export default observer(OpenFocusButton)