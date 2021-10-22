import { observer } from 'mobx-react-lite'
import { makeAutoObservable } from 'mobx'
import { nanoid } from 'nanoid'
import { createContext, useContext, useState } from 'react'
import { DragEndEvent, DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy, } from '@dnd-kit/sortable'
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { CSS } from '@dnd-kit/utilities'
import { HabitEditorContext } from 'pages/habits/[id]'
import { ThemeUIStyleObject } from '@theme-ui/css'
import HabitEditor from '@/lib/logic/app/HabitEditor'
import arrayMove from '@/lib/logic/utils/arrayMove'
import EmojiPaletteInfo from './EmojiPaletteInfo'
import EmojiButton from '@/components/app/EmojiButton'
import Box from '@/components/primitives/Box'
import Flex from '@/components/primitives/Flex'
import Heading from '@/components/primitives/Heading'
import IconButton from '@/components/primitives/IconButton'
import Spacer from '@/components/primitives/Spacer'
import CloseIcon from '@/components/icons/CloseIcon'
import DragHandleIcon from '@/components/icons/DragHandleIcon'
import PlusIcon from '@/components/icons/PlusIcon'

const PaletteEditorContext = createContext<PaletteEditor>(null!)

const EmojiPaletteEditor = observer(() => {
  const habitEditor = useContext(HabitEditorContext)
  const [paletteEditor] = useState(new PaletteEditor(habitEditor))
  const [isVisible, setIsVisible] = useState(false)

  if (!isVisible && habitEditor?.habit?.name) {
    setIsVisible(true)
  }

  return (
    <PaletteEditorContext.Provider value={paletteEditor}>
      <EditorWrapper isVisible={isVisible} />
    </PaletteEditorContext.Provider>
  )
})

const EditorWrapper = observer(({ isVisible }: { isVisible: boolean }) => {
  return (
    <Box sx={{ opacity: isVisible ? 1 : 0, transition: 'opacity 350ms 500ms' }}>
      <HeadingSection />
      <EmojiList />
    </Box>
  )
})

const HeadingSection = () => {
  const { addEmoji } = useContext(PaletteEditorContext)

  return (
    <Flex align="center" sx={{ mb: 3, pb: [3, 4], borderBottom: 'solid 1.5px', borderColor: 'divider' }}>
      <IconButton icon={PlusIcon} onClick={addEmoji} sx={{ mr: 3, p: '0.7rem' }} />
      <Heading level={3} sx={{ fontSize: ['1.25rem', '1.5rem'], fontWeight: 'medium' }}>
        Quick palette
      </Heading>
      <Spacer ml="auto" />
      <EmojiPaletteInfo />
    </Flex>
  )
}

const EmojiList = observer(() => {
  const { paletteData, reorderPalette } = useContext(PaletteEditorContext)
  const [isAnythingDragging, setIsAnythingDragging] = useState(false)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
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
        // Destructuring fixes bug where new emojis have no transform data
        items={[...paletteData]}
        strategy={verticalListSortingStrategy}
      >
        <div>
          {paletteData.map(data => <SortableEmoji id={data.id} isAnythingDragging={isAnythingDragging} key={data.id} />)}
        </div>
      </SortableContext>
    </DndContext>
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over?.id && active.id !== over.id) {
      const itemToMove = paletteData.find((data) => data.id === active.id)
      const itemToTakePlaceOf = paletteData.find((data) => data.id === over.id)
      if (!itemToMove || !itemToTakePlaceOf) return
      const oldIndex = paletteData.indexOf(itemToMove)
      const newIndex = paletteData.indexOf(itemToTakePlaceOf)
      reorderPalette(oldIndex, newIndex)
    }
    setIsAnythingDragging(false)
  }
})

const SortableEmoji = ({ id, isAnythingDragging }: { id: string, isAnythingDragging: boolean }) => {
  let {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const pointerEvents: ThemeUIStyleObject = { pointerEvents: isAnythingDragging ? 'none' : 'auto' }

  return (
    <Flex
      ref={setNodeRef}
      sx={{ width: 'fit-content', marginBottom: 2, }}
      style={style}
    >
      <Flex sx={{ borderRadius: 'default', bg: isDragging ? 'whiteAlpha.20' : 'transparent' }}>
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
        <Box sx={pointerEvents}>
          <EmojiPickerButton id={id} />
        </Box>
      </Flex>
      <Box sx={pointerEvents}>
        <RemoveEmojiButton id={id} />
      </Box>
    </Flex>
  )
}

const EmojiPickerButton = observer(({ id }: { id: string }) => {
  const { paletteData, changeEmoji } = useContext(PaletteEditorContext)
  const emoji = paletteData.find((data) => data.id === id)?.emoji
  if (!emoji) return null

  return (
    <EmojiButton
      value={emoji}
      label="to add to your quick palette"
      buttonSize={"2.8rem"}
      emojiFontSize="1.2rem"
      twemojiSize={18}
      onChangeEmoji={(emoji) => { changeEmoji(id, emoji) }}
    />
  )
})

const RemoveEmojiButton = ({ id }: { id: string }) => {
  const { removeEmoji } = useContext(PaletteEditorContext)

  return (
    <IconButton
      icon={CloseIcon}
      onClick={() => removeEmoji(id)}
      sx={{ ml: 2, bg: 'transparent', color: 'whiteAlpha.40', size: '2.8rem' }}
    />
  )
}

class PaletteEditor {
  public paletteData: Array<{ emoji: string, id: string }>
  private habitEditor

  constructor(habitEditor: HabitEditor) {
    this.paletteData = this.convertToSortableData(habitEditor?.habit?.palette ?? [])
    this.habitEditor = habitEditor
    makeAutoObservable(this)
  }

  public addEmoji = () => {
    this.paletteData.unshift({ emoji: '🙂', id: this.generateId() })
    this.updateHabitEditor()
  }

  public removeEmoji = (id: string) => {
    this.paletteData = this.paletteData.filter((data) => data.id !== id)
    this.updateHabitEditor()
  }

  public changeEmoji = (id: string, emoji: string) => {
    const item = this.paletteData.find((data) => data.id === id)
    if (!item) return
    const index = this.paletteData.indexOf(item)
    this.paletteData[index].emoji = emoji
    this.updateHabitEditor()
  }

  public reorderPalette = (oldIndex: number, newIndex: number) => {
    this.paletteData = arrayMove(this.paletteData, oldIndex, newIndex)
    this.updateHabitEditor()
  }

  private updateHabitEditor = () => {
    this.habitEditor.updateHabit({ palette: this.paletteData.map((data) => data.emoji) })
  }

  private convertToSortableData = (palette: string[]) => {
    return palette.map((emoji) => ({ emoji, id: this.generateId() }))
  }

  private generateId = () => {
    return nanoid(6)
  }
}

export default EmojiPaletteEditor