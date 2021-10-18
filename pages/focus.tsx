import { withApp } from '@/components/app'
import { Flex, Heading, IconButton } from '@/components/primitives'
import { FocusTimer } from '@/components/page/focus'
import { BackIcon } from '@/components/icons'
import NextLink from 'next/link'

const FocusPage = () => {
  return (
    <Flex column sx={{ maxWidth: '500px', margin: 'auto' }}>
      <Flex align="center" sx={{ mb: [2, 3] }}>
        <NextLink href="/home">
          <IconButton icon={BackIcon} sx={{ mr: 3 }} />
        </NextLink>
        <Heading level={2}>Focus</Heading>
      </Flex>
      <FocusTimer />
    </Flex>
  )
}

export default withApp(FocusPage, 'focus')