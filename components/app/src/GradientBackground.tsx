import { observer } from 'mobx-react-lite'
import { Box } from '@/components/primitives'
import accentColor, { AccentColor } from '@/lib/logic/utils/accentColor'
import theme from 'styles/theme'

const gradientMap: Array<{ name: AccentColor, color: string, yOffset: string }> = [
  { name: 'tracker', color: theme.colors.tracker, yOffset: '-500px' },
  { name: 'journal', color: theme.colors.journal, yOffset: '-475px' },
  { name: 'focus', color: theme.colors.focus, yOffset: '-500px' },
  { name: 'neutral', color: theme.colors.text, yOffset: '-1100px' },
  { name: 'off', color: 'transparent', yOffset: '' }
]

const GradientBackground = () => {
  const activeColor = accentColor.current

  return (
    <Box>
      {gradientMap.map(data => (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          height="150px"
          opacity={data.name === activeColor ? 1 : 0}
          background={`linear-gradient(to bottom, ${data.color} ${data.yOffset}, transparent 150px)`}
          style={{ transition: 'opacity 250ms ease-out' }}
          key={data.name}
        />
      ))}
    </Box>
  )
}

export default observer(GradientBackground)