import { observer } from 'mobx-react-lite'
import accentColor, { AccentColor } from '@/logic/utils/accentColor'
import theme from 'styles/theme'

const gradientData: { [id in AccentColor]: { color: string, opacity: number } } = {
  tracker: { color: theme.colors.tracker, opacity: 0.45 },
  notes: { color: theme.colors.notes, opacity: 0.45 },
  focus: { color: theme.colors.focus, opacity: 0.4 },
  neutral: { color: '#8a8a8a', opacity: 0.4 },
  off: { color: 'transparent', opacity: 0 }
}

const GradientBackground = () => {
  const activeColor = accentColor.current

  return (
    <div
      sx={{
        position: 'fixed',
        zIndex: -1,
        top: 0,
        left: 0,
        height: '130px',
        width: '100%',
        opacity: gradientData[activeColor].opacity,
        transition: 'opacity 500ms'
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" height="100%" width="100%">
        <defs>
          <linearGradient id="gradient" gradientTransform="rotate(90)">
            <stop
              offset="0%"
              stopColor={gradientData[activeColor].color}
              style={{ transition: 'stop-color 500ms' }}
            />
            <stop offset="100%" stopColor="var(--background-color)" />
          </linearGradient>
        </defs>
        <rect
          height="100%"
          width="100%"
          fill="url('#gradient')"
        />
      </svg>
    </div>
  )
}

export default observer(GradientBackground)