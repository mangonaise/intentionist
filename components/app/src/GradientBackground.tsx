import { observer } from 'mobx-react-lite'
import { Box } from '@/components/primitives'
import accentColor, { AccentColor } from '@/lib/logic/utils/accentColor'
import theme from 'styles/theme'
import styled from '@emotion/styled'

interface GradientProps {
  gradientColor: string,
  yOffset: number,
  isActive: boolean
}

const Gradient = styled.div(({ gradientColor, yOffset, isActive }: GradientProps) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  height: '150px',
  backgroundImage: `linear-gradient(to bottom, ${gradientColor} ${-yOffset}px, transparent 100%)`,
  opacity: isActive ? 1 : 0,
  transition: 'opacity 250ms ease-out'
}))

const gradientData: Array<{ name: AccentColor, color: string, yOffset: number }> = [
  { name: 'tracker', color: theme.colors.tracker, yOffset: 400 },
  { name: 'journal', color: theme.colors.journal, yOffset: 375 },
  { name: 'focus', color: theme.colors.focus, yOffset: 450 },
  { name: 'neutral', color: theme.colors.text, yOffset: 1000 },
  { name: 'off', color: 'transparent', yOffset: 0 }
]

const GradientBackground = () => {
  const activeColor = accentColor.current

  return (
    <Box>
      {gradientData.map(data => (
        <Gradient
          gradientColor={data.color}
          yOffset={data.yOffset}
          isActive={data.name === activeColor}
          key={data.name}
        />
      ))}
    </Box>
  )
}

export default observer(GradientBackground)