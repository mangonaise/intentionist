import { container } from 'tsyringe'
import { createContext, useState } from 'react'
import { withApp } from '@/components/app'
import { Flex, Heading, IconButton } from '@/components/primitives'
import { FocusTimer } from '@/components/page/focus'
import { BackIcon } from '@/components/icons'
import FocusTimerHandler from '@/lib/logic/app/FocusTimerHandler'
import NextLink from 'next/link'
import Head from 'next/head'

export const FocusTimerContext = createContext<FocusTimerHandler>(null!)

const FocusPage = () => {
  const [timerHandler] = useState(container.resolve(FocusTimerHandler))

  return (
    <FocusTimerContext.Provider value={timerHandler}>
      <Flex column sx={{ maxWidth: '500px', margin: 'auto' }}>
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
}

export default withApp(FocusPage, 'focus')