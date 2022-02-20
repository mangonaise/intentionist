import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { useContext, useEffect, useState } from 'react'
import { findBestMatch } from 'string-similarity'
import { HabitContext } from '@/components/page/home/habit-tracker/HabitWrapper'
import DisplayedHabitsHandler, { FriendHabit } from '@/logic/app/DisplayedHabitsHandler'
import HabitsHandler, { Habit } from '@/logic/app/HabitsHandler'
import FriendsHandler from '@/logic/app/FriendsHandler'
import SelectDropdown from '@/components/modular/SelectDropdown'
import SmartEmoji from '@/components/modular/SmartEmoji'
import ModalPopup from '@/components/modular/ModalPopup'
import Flex from '@/components/primitives/Flex'
import Heading from '@/components/primitives/Heading'
import Box from '@/components/primitives/Box'
import Text from '@/components/primitives/Text'
import Spacer from '@/components/primitives/Spacer'
import IconButton from '@/components/primitives/IconButton'
import Button from '@/components/primitives/Button'
import LinkIcon from '@/components/icons/LinkIcon'

const LinkHabitButton = observer(({ anchorRight }: { anchorRight?: boolean }) => {
  const { habit } = useContext(HabitContext)
  const { linkedHabits, removeLinkedHabit } = container.resolve(HabitsHandler)
  const [showModal, setShowModal] = useState(false)

  if (!habit.friendUid) return null

  const isLinked = !!linkedHabits[habit.id]

  function handleRemoveLinkedHabit() {
    removeLinkedHabit(habit.id)
    const { selectedFriendUid, viewUser } = container.resolve(DisplayedHabitsHandler)
    if (!selectedFriendUid) {
      viewUser(null)
    }
  }

  return (
    <>
      <LinkHabitModal isOpen={showModal} closeModal={() => setShowModal(false)} friendHabit={habit as FriendHabit} />
      <SelectDropdown
        title={isLinked ? 'Linked' : 'Not linked'}
        sx={isLinked ? { '& > button': { px: 0, minWidth: '4.8rem' } } : {}}
        highlight={isLinked}
        highlightColor="buttonAccentAlt"
        anchorRight={anchorRight}
      >
        <SelectDropdown.Item
          title={isLinked ? 'Unlink habit' : 'Create linked habit'}
          description={isLinked
            ? 'This habit will no longer appear on your page.'
            : `Got a similar habit? Link it with this one, and they'll show up side-by-side on your page.`}
          onClick={isLinked ? handleRemoveLinkedHabit : () => setShowModal(true)}
          selected={false}
        />
      </SelectDropdown>
    </>
  )
})

const LinkHabitModal = ({ isOpen, closeModal, friendHabit }: { isOpen: boolean, closeModal: () => void, friendHabit: FriendHabit }) => {
  const [suggestedHabitName, setSuggestedHabitName] = useState<string | undefined | null>()
  const [showAllHabits, setShowAllHabits] = useState(false)
  const { activeHabits, addLinkedHabit, getOrderedHabits } = container.resolve(HabitsHandler)
  const friend = container.resolve(FriendsHandler).friends.find((friend) => friend.uid === friendHabit.friendUid)
  const suggestedHabit = suggestedHabitName ? Object.values(activeHabits).find((habit) => habit.name === suggestedHabitName) : null

  function handleAddLinkedHabit(linkedHabit: Habit) {
    addLinkedHabit({
      friendHabitId: friendHabit.id,
      friendUid: friendHabit.friendUid,
      linkedHabitId: linkedHabit.id
    })
    closeModal()
  }

  useEffect(() => {
    if (isOpen) {
      if (suggestedHabitName) {
        setShowAllHabits(false)
      } else if (suggestedHabitName === undefined) {
        const { bestMatch } = findBestMatch(friendHabit.name, Object.values(activeHabits).map((habit) => habit.name))
        if (bestMatch.rating >= 0.65) {
          setSuggestedHabitName(bestMatch.target)
        } else {
          setSuggestedHabitName(null)
          setShowAllHabits(true)
        }
      }
    }
  }, [isOpen])

  return (
    <ModalPopup isOpen={isOpen} closeModal={closeModal}>
      <Flex center column>
        <Heading sx={{ my: 6 }}>Link habit</Heading>
        <Box sx={{ px: 4 }}>
          <Box sx={{
            maxWidth: '360px',
            bg: 'whiteAlpha.5',
            borderRadius: 'default',
            p: 4,
            fontWeight: 'light'
          }}>
            <Text sx={{ mb: 2 }}>
              Choose which of your habits you'd like to link with <b sx={{ color: 'textAccent' }}>{friendHabit.name}</b>.
            </Text>
            <Text sx={{ color: 'whiteAlpha.50' }}>
              This won't affect what {friend?.displayName} sees on their page. You can unlink your habit at any time.
            </Text>
          </Box>
          <Box sx={{ mt: 4, mb: 4 }}>
            {!showAllHabits && !!suggestedHabit && <>
              <Text type="span" sx={{ display: 'block', color: 'whiteAlpha.50' }}>Suggested</Text>
              <LinkableHabit habit={suggestedHabit} onLink={handleAddLinkedHabit} />
              <Button onClick={() => setShowAllHabits(true)} sx={{ width: '100%', mt: 2 }}>
                Show all habits
              </Button>
            </>}

            {showAllHabits && getOrderedHabits().map((habit) => (
              <LinkableHabit habit={habit} onLink={handleAddLinkedHabit} key={habit.id} />
            ))}
          </Box>
        </Box>
      </Flex>
    </ModalPopup >
  )
}

const LinkableHabit = ({ habit, onLink }: { habit: Habit, onLink: (habit: Habit) => void }) => {
  return (
    <Flex align="center" sx={{ mb: 2 }}>
      <Flex asSpan center sx={{ width: '1.6rem' }}>
        <SmartEmoji nativeEmoji={habit.icon} rem={1.2} />
      </Flex>
      <Text
        type="span"
        sx={{ ml: 2, maxWidth: 'min(calc(100vw - 9.5rem), 287px)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
      >
        {habit.name}
      </Text>
      <Spacer ml="auto" />
      <IconButton
        icon={LinkIcon}
        onClick={() => onLink(habit)}
        hoverEffect="opacity"
        sx={{ bg: 'buttonAccent', ml: 2 }}
      />
    </Flex>
  )
}

export default LinkHabitButton