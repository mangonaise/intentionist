import type { AppProps } from 'next/app'
import '../styles/globals.scss'
import '@abraham/reflection'
import { container } from 'tsyringe'
import { ThemeProvider } from '@emotion/react'
import Router from 'next/router'
import theme from 'styles/theme'

container.register('Router', { useValue: Router })

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}
export default MyApp
