import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { useContext, useState } from 'react'
import { DragEndEvent, DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy, } from '@dnd-kit/sortable'
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { CSS } from '@dnd-kit/utilities'
import { SmartEmoji } from '@/components/app'
import { Button, Flex, Icon, IconButton } from '@/components/primitives'
import { DragHandleIcon, PencilIcon } from '@/components/icons'
import { HabitFilterContext } from 'pages/habits'
import HabitsHandler, { Habit } from '@/lib/logic/app/HabitsHandler'
import NextLink from 'next/link'

const FilteredHabitsList = () => {
  const { filteredHabits, refresh } = useContext(HabitFilterContext)
  const { habits, reorderHabits } = container.resolve(HabitsHandler)
  const [isAnythingDragging, setIsAnythingDragging] = useState(false)
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
      onDragEnd={handleDragEnd}
      onDragCancel={() => setIsAnythingDragging(false)}
      onDragStart={() => setIsAnythingDragging(true)}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
    >
      <SortableContext
        items={filteredHabits}
        strategy={verticalListSortingStrategy}
      >
        <div>
          {filteredHabits.map(habit => <SortableHabitButton habit={habit} isAnythingDragging={isAnythingDragging} key={habit.id} />)}
        </div>
      </SortableContext>
    </DndContext>
  )

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
    setIsAnythingDragging(false)
  }
}

const SortableHabitButton = ({ habit, isAnythingDragging }: { habit: Habit, isAnythingDragging: boolean }) => {
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
    <Flex
      ref={setNodeRef}
      sx={{
        borderRadius: 'default',
        marginBottom: 1,
        backgroundColor: isDragging ? 'whiteAlpha.20' : 'transparent'
      }}
      style={style}
    >
      <IconButton
        icon={DragHandleIcon}
        hoverEffect="none"
        sx={{
          paddingX: 2,
          backgroundColor: 'transparent',
          color: isDragging ? 'whiteAlpha.100' : 'whiteAlpha.30',
          touchAction: 'none'
        }}
        {...listeners} {...attributes}
      />
      <NextLink href={`/habits/${habit.id}`} key={habit.id}>
        <Button
          hoverEffect={isAnythingDragging ? 'none' : 'default'}
          sx={{
            width: '100%', px: 3,
            backgroundColor: 'transparent',
            textAlign: 'left',
            'svg': { opacity: 0.25, },
            '&:hover svg': {
              opacity: isAnythingDragging ? undefined : 1
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
    </Flex>
  )
}

export default observer(FilteredHabitsList)