import { WeekView } from '@/lib/app/weeksHandler'

const theme = {
  breakpoints: ['600px', '1250px',],
  colors: {
    text: 'var(--text-color)',
    background: 'var(--background-color)',
    button: 'var(--button-color)',
    buttonHighlight: 'var(--button-highlight-color)',
    accent: 'var(--accent-color)',
    tracker: 'var(--tracker-accent-color)',
    journal: 'var(--journal-accent-color)',
    focus: 'var(--focus-accent-color)'
  },
  fonts: {
    body: 'sans-serif',
    heading: 'sans-serif'
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  radii: {
    default: '6px'
  },
  sizes: {
    max: '1200px'
  },
  space: ['0', '0.25rem', '0.5rem', '0.75rem', '1rem', '1.25rem', '1.5rem', '1.75rem', '2rem']
}

export function setAccentColor(accent: WeekView | 'neutral' | null) {
  const map: { [x in WeekView | 'neutral']: { color: string, gradientOffset: string } } = {
    tracker: { color: theme.colors.tracker, gradientOffset: '-500px' },
    journal: { color: theme.colors.journal, gradientOffset: '-500px' },
    focus: { color: theme.colors.focus, gradientOffset: '-600px' },
    neutral: { color: theme.colors.text, gradientOffset: '-1000px' }
  }
  if (accent) {
    const { color, gradientOffset } = map[accent]
    document.documentElement.style.setProperty('--accent-color', color)
    document.documentElement.style.setProperty('--accent-gradient-offset', gradientOffset)
  } else {
    document.documentElement.style.removeProperty('--accent-color')
    document.documentElement.style.removeProperty('--accent-gradient-offset')
  }
}

export default theme