import SmartEmoji from '@/components/modular/SmartEmoji'
import Flex from '@/components/primitives/Flex'
import Box from '@/components/primitives/Box'
import Heading from '@/components/primitives/Heading'
import Text from '@/components/primitives/Text'

const NewUserHabitsGuide = () => {
  return (
    <Flex column align="center" sx={{ pt: [2, 4], pb: [4, 6], textAlign: 'center' }}>
      <Flex center sx={{ p: 4 }}>
        <SmartEmoji nativeEmoji="🌱" rem={2.25} />
      </Flex>
      <Heading level={2} sx={{ pt: [3, 4], pb: [4, 6], fontSize: ['1.75rem', '2rem'], fontWeight: 'bold' }}>
        Let's add your first habit.
      </Heading>
      <Box sx={{ maxWidth: '800px', px: 2, margin: 'auto', fontWeight: 'light' }}>
        <Text sx={{ mb: 2 }}>
          Progress is made one day at a time.
        </Text>
        <Text>
          Start by pressing the <b sx={{ color: 'textAccent' }}>+</b> button above.
        </Text>
      </Box>
    </Flex>
  )
}

export default NewUserHabitsGuide