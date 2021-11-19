import { observer } from 'mobx-react-lite'
import theme from 'styles/theme'

const GradientBackground = () => {
  return (
    <div
      sx={{
        position: 'fixed',
        zIndex: -1,
        top: 0,
        left: 0,
        height: '130px',
        width: '100%',
        opacity: 0.45,
        transition: 'opacity 500ms'
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" height="100%" width="100%">
        <defs>
          <linearGradient id="gradient" gradientTransform="rotate(90)">
            <stop
              offset="0%"
              stopColor={theme.colors.accent}
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