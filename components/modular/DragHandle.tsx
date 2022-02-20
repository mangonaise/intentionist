import type { DraggableSyntheticListeners } from '@dnd-kit/core'
import { observer } from 'mobx-react-lite'
import IconButton from '@/components/primitives/IconButton'
import DragHandleIcon from '@/components/icons/DragHandleIcon'

export interface DragHandleProps {
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

export default DragHandle