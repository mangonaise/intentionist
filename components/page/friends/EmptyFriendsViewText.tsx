import Flex from '@/components/primitives/Flex'
import Text from '@/components/primitives/Text'

const EmptyFriendsViewText = ({ text }: { text: string }) => {
  return (
    <Flex center sx={{ height: '4rem' }}>
      <Text sx={{ fontSize: '1.2rem', textAlign: 'center', color: 'whiteAlpha.60' }}>
        {text}
      </Text>
    </Flex>
  )
}

export default EmptyFriendsViewText