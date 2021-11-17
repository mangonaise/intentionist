import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import WeekHandler from '@/logic/app/WeekHandler'
import accentColor from '@/logic/utils/accentColor'
import Flex from '@/components/primitives/Flex'
import Icon from '@/components/primitives/Icon'
import Text from '@/components/primitives/Text'
import UpLeftArrowIcon from '@/components/icons/UpLeftArrowIcon'

const CondensedViewAlert = () => {
  const { habitsInView, condenseView, friendUid } = container.resolve(WeekHandler).weekInView

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
        Empty rows are currently hidden.{friendUid ? '' : ' Unhide them to make changes.'}
      </Text>
    </Flex>
  )
}

export default observer(CondensedViewAlert)