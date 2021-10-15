import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { Flex, Icon, Text } from '@/components/primitives'
import { UpLeftArrowIcon } from '@/components/icons'
import WeekHandler from '@/lib/logic/app/WeekHandler'
import accentColor from '@/lib/logic/utils/accentColor'

const CondensedViewAlert = () => {
  const { condenseView, habitsInView } = container.resolve(WeekHandler)

  if (!condenseView || habitsInView.length > 0) return null

  return (
    <Flex
      align="center"
      sx={{
        pt: 1,
        pb: 6,
        pr: 2,
        gridColumn: '1 / -1',
        borderTop: 'solid 1px',
        borderColor: 'grid'
      }}
    >
      <Icon icon={UpLeftArrowIcon} sx={{ mx: 6, transform: 'scale(1.8)' }} />
      <Text type="p" sx={{ color: accentColor.current, fontWeight: 'semibold', mt: 5 }}>
        Empty rows are currently hidden. Unhide them to make changes.
      </Text>
    </Flex>
  )
}

export default observer(CondensedViewAlert)