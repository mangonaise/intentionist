import '../styles/globals.scss'
import '@abraham/reflection'
import { container } from 'tsyringe'
import { AppProps } from 'next/app'
import { ThemeProvider } from '@emotion/react'
import theme, { windowsScrollbarStyle } from 'styles/theme'
import React from 'react'
import initializeFirebase from '@/lib/firebase'
import isWindowsOS from '@/logic/utils/isWindowsOS'
import Head from 'next/head'
import Router from 'next/router'

if (typeof window === 'undefined') React.useLayoutEffect = React.useEffect
container.register('Router', { useValue: Router })

initializeFirebase()

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      {isWindowsOS && <Head><style>{windowsScrollbarStyle}</style></Head>}
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default MyApp