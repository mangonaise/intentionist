import Flex from '@/components/primitives/Flex'
import Icon from '@/components/primitives/Icon'
import EllipsisIcon from '@/components/icons/EllipsisIcon'

const FriendsLoadingIndicator = () => {
  return (
    <Flex center sx={{ minHeight: '5rem', width: '100%' }}>
      <Icon icon={EllipsisIcon} sx={{ fontSize: '1.5rem', animation: 'pulse infinite 2s' }} />
    </Flex>
  )
}

export default FriendsLoadingIndicator
