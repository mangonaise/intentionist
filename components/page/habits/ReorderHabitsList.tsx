import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { forwardRef, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { DragStartEvent, DragEndEvent, DragOverlay, DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy, } from '@dnd-kit/sortable'
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { CSS } from '@dnd-kit/utilities'
import HabitsHandler, { Habit } from '@/logic/app/HabitsHandler'
import DisplayedHabitsHandler from '@/logic/app/DisplayedHabitsHandler'
import DragHandle, { DragHandleProps } from '@/components/app/DragHandle'
import SmartEmoji from '@/components/app/SmartEmoji'
import EmptyPageText from '@/components/app/EmptyPageText'
import Flex from '@/components/primitives/Flex'
import Text from '@/components/primitives/Text'

function createHabitsMap(habits: Habit[]) {
  return habits.reduce<{ [habitId: string]: Habit }>((map, habit) => {
    map[habit.id] = habit
    return map
  }, {})
}

const ReorderHabitsList = observer(() => {
  const router = useRouter()
  const { isLoadingHabits, selectedFriendUid, habitsInView, refreshHabitsInView } = container.resolve(DisplayedHabitsHandler)
  const { reorderHabitsLocally } = container.resolve(HabitsHandler)
  const [draggedHabitId, setDraggedHabitId] = useState<string | null>(null)

  const [habitsMap, setHabitsMap] = useState<{ [habitId: string]: Habit } | null>(null)

  if (!isLoadingHabits && !habitsMap) setHabitsMap(createHabitsMap(habitsInView))

  useEffect(() => {
    if (selectedFriendUid) {
      router.push('/home')
    }
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  if (!habitsMap) return null
  if (!habitsInView.length || selectedFriendUid) return <EmptyPageText text="Nothing to see here!" />

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
    >
      <SortableContext
        items={habitsInView}
        strategy={verticalListSortingStrategy}
      >
        <div>
          {habitsInView.map(habit => <SortableHabit habit={habit} key={habit.id} />)}
        </div>
      </SortableContext>
      <DragOverlay>
        {!!draggedHabitId && <HabitWrapper isDragOverlay habit={habitsMap[draggedHabitId]} />}
      </DragOverlay>
    </DndContext>
  )

  function handleDragStart(event: DragStartEvent) {
    setDraggedHabitId(event.active.id)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over?.id && active.id !== over.id) {
      reorderHabitsLocally(active.id, over.id)
      refreshHabitsInView()
    }
    setDraggedHabitId(null)
  }
})

const SortableHabit = ({ habit }: { habit: Habit }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: habit.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <HabitWrapper
      habit={habit}
      ref={setNodeRef}
      style={style}
      attributes={attributes}
      listeners={listeners}
      isDragging={isDragging}
    />
  )
}

interface HabitWrapperProps extends DragHandleProps {
  habit: Habit,
  isDragging?: boolean,
  style?: {
    transform: string | undefined
    transition: string | undefined
  }
}

const HabitWrapper = forwardRef(function HabitWrapper(props: HabitWrapperProps, ref: any) {
  const { habit, isDragging, isDragOverlay, style, listeners, attributes } = props

  return (
    <Flex
      ref={ref}
      align="center"
      sx={{
        marginBottom: 2,
        backgroundColor: isDragOverlay ? 'whiteAlpha.20' : 'transparent',
        borderRadius: 'default',
        opacity: isDragging ? 0 : 1
      }}
      style={style}
    >
      <DragHandle listeners={listeners} attributes={attributes} isDragOverlay={isDragOverlay} />
      <div sx={{ pointerEvents: isDragOverlay ? 'none' : 'auto', width: '100%' }}>
        <HabitPreview habit={habit} />
      </div>
    </Flex>
  )
})

const HabitPreview = observer(({ habit }: { habit: Habit & { friendUid?: string } }) => {
  const belongsToFriend = !!habit.friendUid

  return (
    <Flex center justify="flex-start" sx={{ pr: 3 }}>
      <Flex center sx={{ mr: [3, 4], minWidth: '1.3rem' }}>
        <SmartEmoji nativeEmoji={habit.icon} rem={1.3} />
      </Flex>
      <Text type="span" sx={{
        maxWidth: '800px', overflow: 'hidden', textOverflow: 'ellipsis',
        color: belongsToFriend ? 'textAccentAlt' : undefined,
        fontWeight: belongsToFriend ? 'semibold' : undefined
      }}>
        {habit.name}
      </Text>
    </Flex>
  )
})

export default ReorderHabitsList