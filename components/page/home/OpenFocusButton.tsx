import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { HomePageContext } from 'pages/home'
import WeekInView from '@/logic/app/WeekInView'
import Box from '@/components/primitives/Box'
import IconButton from '@/components/primitives/IconButton'
import ArrowRightIcon from '@/components/icons/ArrowRightIcon'
import NextLink from 'next/link'

const OpenFocusButton = () => {
  const { viewMode } = container.resolve(WeekInView)
  const { narrow } = useContext(HomePageContext)

  if (viewMode !== 'focus') return null

  return (
    <Box
      sx={{
        flex: narrow ? null : 1,
        width: narrow ? '100%' : 'auto',
        mt: narrow ? 2 : 0,
        ml: narrow ? 0 : 2,
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
              borderRadius: 'inherit',
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