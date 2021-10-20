import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { createContext, useEffect, useState } from 'react'
import { LoadingScreen, withApp } from '@/components/app'
import { FadeIn, Flex, Heading, IconButton } from '@/components/primitives'
import { FocusTimer } from '@/components/page/focus'
import { BackIcon } from '@/components/icons'
import FocusTimerHandler from '@/lib/logic/app/FocusTimerHandler'
import NextLink from 'next/link'
import Head from 'next/head'
import WeekHandler from '@/lib/logic/app/WeekHandler'

export const FocusTimerContext = createContext<FocusTimerHandler>(null!)

const FocusPage = observer(() => {
  const { isLoadingWeek } = container.resolve(WeekHandler)
  const [timerHandler, setTimerHandler] = useState<FocusTimerHandler | undefined>()

  useEffect(() => {
    setTimerHandler(container.resolve(FocusTimerHandler))
  }, [])

  if (!timerHandler) return <></>

  return (
    <FocusTimerContext.Provider value={timerHandler}>
      <Flex column sx={{ maxWidth: '500px', margin: 'auto', pointerEvents: isLoadingWeek ? 'none' : null }}>
        <Head><title>Focus</title></Head>
        <Flex align="center" sx={{ mb: [2, 3] }}>
          <NextLink href="/home">
            <IconButton icon={BackIcon} sx={{ mr: 3 }} />
          </NextLink>
          <Heading level={2}>Focus</Heading>
        </Flex>
        <FocusTimer />
      </Flex>
    </FocusTimerContext.Provider>

  )
})

export default withApp(FocusPage, 'focus')