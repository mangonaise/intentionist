import { observer } from 'mobx-react-lite'
import accentColorHandler, { AccentColor } from '@/logic/ui/accentColorHandler'
import theme from 'styles/theme'
import Box from '../primitives/Box'
import FadeIn from '../primitives/FadeIn'

const gradientMap: Array<{ name: AccentColor, color: string, yOffset: string }> = [
  { name: 'tracker', color: theme.colors.tracker, yOffset: '-500px' },
  { name: 'journal', color: theme.colors.journal, yOffset: '-475px' },
  { name: 'focus', color: theme.colors.focus, yOffset: '-500px' },
  { name: 'neutral', color: theme.colors.text, yOffset: '-1000px' },
  { name: 'off', color: 'transparent', yOffset: '' }
]

const GradientBackground = () => {
  const activeColor = accentColorHandler.accentColor

  return (
    <FadeIn>
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
    </FadeIn>
  )
}

export default observer(GradientBackground)