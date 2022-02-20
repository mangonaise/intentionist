import { container } from 'tsyringe'
import { createContext, Dispatch, SetStateAction, useEffect, useState } from 'react'
import FriendRequestsHandler from '@/logic/app/FriendRequestsHandler'
import FriendsList from '@/components/page/friends/FriendsList'
import FriendRequestsView from '@/components/page/friends/FriendRequestsView'
import PendingFriendRequestModal from '@/components/page/friends/PendingFriendRequestModal'
import FriendsPageNavSection from '@/components/page/friends/FriendsPageNavSection'
import withApp from '@/components/modular/withApp'
import Box from '@/components/primitives/Box'

export type FriendsPageTab = 'friends' | 'requests'

export const FriendsPageContext = createContext<{
  tab: FriendsPageTab,
  setTab: Dispatch<SetStateAction<FriendsPageTab>>
}>(null!)

const FriendsPage = () => {
  const [tab, setTab] = useState<FriendsPageTab>('friends')
  useFriendRequestsListener()

  return (
    <FriendsPageContext.Provider value={{ tab, setTab }}>
      <PendingFriendRequestModal />
      <Box sx={{ maxWidth: '800px', margin: 'auto' }}>
        <FriendsPageNavSection />
        {tab === 'friends' ? <FriendsList /> : <FriendRequestsView />}
      </Box>
    </FriendsPageContext.Provider>
  )
}

function useFriendRequestsListener() {
  const { startListener, stopListener } = container.resolve(FriendRequestsHandler)
  useEffect(() => {
    startListener()
    return () => stopListener()
  }, [])
}

export default withApp(FriendsPage)