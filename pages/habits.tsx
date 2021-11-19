import { container } from 'tsyringe'
import { useState } from 'react'
import HabitsHandler from '@/logic/app/HabitsHandler'
import withApp from '@/components/app/withApp'
import Head from 'next/head'

const HabitsPage = () => {
  const [showGuide] = useState(container.resolve(HabitsHandler).habits.length === 0)

  return (
    <>
      <Head><title>Habits</title></Head>
      <div>Out of order</div>
    </>
  )
}

export default withApp(HabitsPage)