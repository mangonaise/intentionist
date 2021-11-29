import FadeIn from '@/components/primitives/FadeIn'
import Flex from '@/components/primitives/Flex'
import Text from '@/components/primitives/Text'

const EmptyPageText = ({ text }: { text: string }) => {
  return (
    <FadeIn delay={100}>
      <Flex center sx={{ height: '4rem' }}>
        <Text sx={{ fontSize: '1.2rem', textAlign: 'center', color: 'whiteAlpha.60' }}>
          {text}
        </Text>
      </Flex>
    </FadeIn>
  )
}

export default EmptyPageText