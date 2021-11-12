import { observer } from 'mobx-react-lite'
import { useContext, useEffect, useRef, useState } from 'react'
import { NoteContext } from 'pages/note'
import Dropdown from '@/components/app/Dropdown'
import Flex from '@/components/primitives/Flex'
import Button from '@/components/primitives/Button'
import IconButton from '@/components/primitives/IconButton'
import BackIcon from '@/components/icons/BackIcon'
import CheckIcon from '@/components/icons/CheckIcon'
import PencilIcon from '@/components/icons/PencilIcon'
import NextLink from 'next/link'

const NoteNavSection = () => {
  const { editor: { isEditing } } = useContext(NoteContext)

  if (isEditing) {
    return <EditorNavSection />

  } else {
    return <DefaultNavSection />
  }
}

const EditorNavSection = observer(() => {
  const wrapperRef = useRef(null!)
  const [isWrapperPinned, setIsWrapperPinned] = useState(false)
  const { editor } = useContext(NoteContext)

  useEffect(() => {
    const stickyElement = wrapperRef.current
    const observer = new IntersectionObserver(
      ([e]) => setIsWrapperPinned(e.intersectionRatio < 1),
      { threshold: [1] }
    )
    observer.observe(stickyElement)
    return () => observer.disconnect()
  }, [])

  return (
    <Flex
      ref={wrapperRef}
      sx={{
        position: 'sticky',
        top: '-1px',
        zIndex: 1,
        borderRadius: 'default',
        paddingTop: isWrapperPinned ? 2 : 0
      }}
    >
      <IconButton
        icon={CheckIcon}
        onClick={editor.finishEditing}
        hoverEffect={isWrapperPinned ? 'none' : 'opacity'}
        sx={{ mr: 2, bg: 'notes' }}
      >
        Done
      </IconButton>
      {(!editor.isNewNote || editor.hasUnsavedChanges) && (
        <Button
          onClick={editor.saveChanges}
          disabled={!editor.hasUnsavedChanges}
          hoverEffect={isWrapperPinned ? 'none' : 'default'}
          sx={{
            flexGrow: [1, 0],
            marginRight: 2,
            opacity: isWrapperPinned ? 0.9 : 1,
            backgroundColor: isWrapperPinned ? 'bg' : null,
            '&:disabled': {
              paddingX: isWrapperPinned ? 3 : 2,
              opacity: 0.9,
              color: 'whiteAlpha.50',
              background: isWrapperPinned ? null : 'none',
              textAlign: isWrapperPinned ? 'center' : 'left'
            }
          }}
        >
          {editor.hasUnsavedChanges
            ? 'Save changes'
            : editor.isSaving ? 'Saving...' : 'Changes saved'}
        </Button>
      )}
      {!isWrapperPinned && (
        <Dropdown anchorRight sx={{ ml: 'auto' }}>
          <Dropdown.Item itemAction={editor.deleteNote}>Delete note</Dropdown.Item>
        </Dropdown>
      )}
    </Flex >
  )
})

const DefaultNavSection = () => {
  const { editor } = useContext(NoteContext)

  return (
    <Flex>
      <NextLink href="/home">
        <IconButton icon={BackIcon} sx={{ bg: 'transparent' }} />
      </NextLink>
      <IconButton
        icon={PencilIcon}
        onClick={editor.startEditing}
        sx={{ bg: 'notes', ml: 2 }}
        hoverEffect="opacity"
      />
    </Flex>
  )
}

export default NoteNavSection