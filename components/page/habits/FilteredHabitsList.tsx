import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { forwardRef, useContext, useState } from 'react'
import { DraggableSyntheticListeners, DragStartEvent, DragEndEvent, DragOverlay, DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy, } from '@dnd-kit/sortable'
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { CSS } from '@dnd-kit/utilities'
import { HabitFilterContext } from 'pages/habits'
import HabitsHandler, { Habit } from '@/lib/logic/app/HabitsHandler'
import SmartEmoji from '@/components/app/SmartEmoji'
import Button from '@/components/primitives/Button'
import Flex from '@/components/primitives/Flex'
import Icon from '@/components/primitives/Icon'
import IconButton from '@/components/primitives/IconButton'
import DragHandleIcon from '@/components/icons/DragHandleIcon'
import PencilIcon from '@/components/icons/PencilIcon'
import NextLink from 'next/link'

const FilteredHabitsList = () => {
  const { filteredHabits, refresh } = useContext(HabitFilterContext)
  const { habits, reorderHabits } = container.resolve(HabitsHandler)
  const [draggedHabitId, setDraggedHabitId] = useState<string | null>(null)

  const [habitsMap] = useState(habits.reduce<{ [habitId: string]: Habit }>((map, habit) => {
    map[habit.id] = habit
    return map
  }, {}))

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
    >
      <SortableContext
        items={filteredHabits}
        strategy={verticalListSortingStrategy}
      >
        <div>
          {filteredHabits.map(habit => <SortableHabit habit={habit} key={habit.id} />)}
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
      const habitToMove = habits.find((habit) => habit.id === active.id)
      const takesPlaceOf = habits.find((habit) => habit.id === over.id)
      if (habitToMove && takesPlaceOf) {
        reorderHabits(habitToMove, takesPlaceOf)
        refresh()
      }
    }
    setDraggedHabitId(null)
  }
}

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
      ref={setNodeRef}
      style={style}
      attributes={attributes}
      listeners={listeners}
      habit={habit}
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
      sx={{
        opacity: isDragging ? 0 : 1,
        borderRadius: 'default',
        marginBottom: 1,
        backgroundColor: isDragOverlay ? 'whiteAlpha.20' : 'transparent'
      }}
      style={style}
    >
      <DragHandle listeners={listeners} attributes={attributes} isDragOverlay={isDragOverlay} />
      <div sx={{ pointerEvents: isDragOverlay ? 'none' : 'auto', width: '100%' }}>
        <HabitLink habit={habit} />
      </div>
    </Flex>
  )
})

interface DragHandleProps {
  isDragOverlay?: boolean,
  listeners?: DraggableSyntheticListeners,
  attributes?: any
}

const DragHandle = observer(({ isDragOverlay, listeners, attributes }: DragHandleProps) => {
  return (
    <IconButton
      icon={DragHandleIcon}
      hoverEffect="none"
      sx={{
        paddingX: 2,
        backgroundColor: 'transparent',
        color: isDragOverlay ? 'whiteAlpha.100' : 'whiteAlpha.30',
        touchAction: 'none'
      }}
      {...listeners}
      {...attributes}
    />
  )
})

const HabitLink = observer(({ habit }: { habit: Habit }) => {
  return (
    <NextLink href={`/habits/${habit.id}`}>
      <Button
        sx={{
          width: '100%', px: 3,
          backgroundColor: 'transparent',
          textAlign: 'left',
          'svg': { opacity: 0.25, },
          '&:hover svg': {
            opacity: 1
          }
        }}
      >
        <Flex center justify="flex-start" sx={{ maxWidth: '100%', overflowWrap: 'break-word', wordWrap: 'break-word' }}>
          <Flex center sx={{ mr: [3, 4], fontSize: '1.15rem', width: '1.15rem' }}>
            <SmartEmoji nativeEmoji={habit.icon} twemojiSize={20} />
          </Flex>
          {habit.name}
          <Icon icon={PencilIcon} sx={{ ml: 'auto', pl: 2, fontSize: '1.1rem' }} />
        </Flex>
      </Button>
    </NextLink>
  )
})

export default observer(FilteredHabitsList)