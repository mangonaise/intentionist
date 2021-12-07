import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { useCallback, useEffect, useState } from 'react'
import HabitsHandler from '@/logic/app/HabitsHandler'
import EmptyPageText from '@/components/app/EmptyPageText'
import Dropdown from '@/components/app/Dropdown'
import SmartEmoji from '@/components/app/SmartEmoji'
import ModalPopup from '@/components/app/ModalPopup'
import Flex from '@/components/primitives/Flex'
import Text from '@/components/primitives/Text'
import Spacer from '@/components/primitives/Spacer'
import Icon from '@/components/primitives/Icon'
import Button from '@/components/primitives/Button'
import FadeIn from '@/components/primitives/FadeIn'
import EllipsisIcon from '@/components/icons/EllipsisIcon'
import CheckFillIcon from '@/components/icons/CheckFillIcon'

const ArchivedHabitsList = observer(() => {
  const { archivedHabits, loadArchivedHabits, restoreArchivedHabitById } = container.resolve(HabitsHandler)
  const [restoringHabitId, setRestoringHabitId] = useState<string | null>(null)

  const handleRestoreHabit = useCallback((habitId: string) => {
    restoreArchivedHabitById(habitId)
    setRestoringHabitId(habitId)
  }, [])

  useEffect(() => {
    if (!archivedHabits) {
      loadArchivedHabits()
    }
  }, [])

  if (!archivedHabits) return <EmptyPageText text="Loading..." />

  const orderedArchivedHabits = Object.entries(archivedHabits)
    .sort(([_a, dataA], [_b, dataB]) => dataB.archiveTime - dataA.archiveTime)
    .map(([id, data]) => ({ ...data, id }))

  return (
    <FadeIn>
      <RestoreHabitModal
        habitId={restoringHabitId}
        closeModal={() => setRestoringHabitId(null)}
      />
      {!orderedArchivedHabits.length && <EmptyPageText />}
      {orderedArchivedHabits.map((habit) => (
        <Flex align="center" key={habit.id}>
          <Flex center sx={{ mr: [3, 4], minWidth: '1.3rem' }}>
            <SmartEmoji nativeEmoji={habit.icon} rem={1.3} />
          </Flex>
          <Text
            type="span"
            sx={{ maxWidth: '800px', overflow: 'hidden', textOverflow: 'ellipsis', }}>
            {habit.name}
          </Text>
          <Spacer ml="auto" />
          <Dropdown anchorRight sx={{ '& > button': { bg: 'transparent' } }}>
            <Dropdown.Item itemAction={() => handleRestoreHabit(habit.id)}>
              Restore
            </Dropdown.Item>
          </Dropdown>
        </Flex>
      ))}
    </FadeIn>
  )
})

const RestoreHabitModal = ({ habitId, closeModal }: { habitId: string | null, closeModal: () => void }) => {
  const [latestHabitId, setLatestHabitId] = useState<null | string>(habitId)

  useEffect(() => {
    if (habitId) setLatestHabitId(habitId)
  }, [habitId])

  if (!latestHabitId) return null
  const { activeHabits } = container.resolve(HabitsHandler)
  const hasRestored = !!activeHabits[latestHabitId]

  return (
    <ModalPopup
      isOpen={!!habitId}
      closeModal={closeModal}
      disableClose={!hasRestored}
    >
      <Flex column sx={{ width: '350px', maxWidth: 'calc(100vw - 2.4rem)', mt: 4 }}>
        <Flex center column>
          <Icon
            sx={{
              fontSize: '1.75rem', mb: 4,
              animation: hasRestored ? null : 'pulse infinite 1.5s'
            }}
            icon={hasRestored ? CheckFillIcon : EllipsisIcon}
          />
        </Flex>
        <Flex center column sx={{
          p: 4, mx: 4, mb: 4, minHeight: '5rem',
          bg: 'whiteAlpha.5', borderRadius: 'default', textAlign: 'center'
        }}>
          <Text>
            {hasRestored ? 'Habit restored!' : 'Restoring archived habit...'}
          </Text>
        </Flex>
        {hasRestored && (
          <Button onClick={closeModal} sx={{ m: 4, mt: 0 }}>
            OK
          </Button>
        )}
      </Flex>
    </ModalPopup>
  )
}

export default ArchivedHabitsList