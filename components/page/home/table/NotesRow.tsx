import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { useRouter } from 'next/router'
import WeekHandler, { NoteMetadata } from '@/logic/app/WeekHandler'
import SmartEmoji from '@/components/app/SmartEmoji'
import Button from '@/components/primitives/Button'
import Flex from '@/components/primitives/Flex'
import IconButton from '@/components/primitives/IconButton'
import Text from '@/components/primitives/Text'
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon'
import ChevronRightIcon from '@/components/icons/ChevronRightIcon'
import PlusIcon from '@/components/icons/PlusIcon'
import NextLink from 'next/link'

const NotesRow = observer(({ habitId, readonly }: { habitId: string, readonly: boolean }) => {
  const { weekInView: { getNoteDataForHabit, friendUid }, isLoadingWeek } = container.resolve(WeekHandler)
  const cellNotesData = isLoadingWeek ? [] : getNoteDataForHabit(habitId)

  return (
    <Flex
      align="center"
      sx={{
        position: 'relative',
        borderTop: 'solid 1px', borderLeft: 'solid 1px', borderColor: 'grid',
        '&::before': readonly ? {
          zIndex: -1,
          position: 'absolute',
          inset: 0,
          content: '""',
          backgroundColor: 'notes',
          opacity: 0.085
        } : {}
      }}
    >
      {cellNotesData.length > 0 && <NotePreview cellNotesData={cellNotesData} />}
      {!friendUid && <AddNoteButton habitId={habitId} disabled={readonly} />}
    </Flex>
  )
})

const NotePreview = ({ cellNotesData }: { cellNotesData: Array<{ noteId: string, metadata: NoteMetadata }> }) => {
  const router = useRouter()
  const { weekInView: { data: { startDate } }, latestWeekStartDate } = container.resolve(WeekHandler)
  const isViewingLatestWeek = startDate === latestWeekStartDate
  const [viewedNoteIndex, setViewedNoteIndex] = useState(isViewingLatestWeek ? cellNotesData.length - 1 : 0)
  const viewedNoteData = cellNotesData[viewedNoteIndex]

  if (!viewedNoteData && viewedNoteIndex > 0) {
    setViewedNoteIndex(0)
    return null
  }

  function changeViewedNote(delta: 1 | -1) {
    let newIndex = viewedNoteIndex + delta
    if (newIndex < 0) {
      newIndex = cellNotesData.length - 1
    } else if (newIndex > cellNotesData.length - 1) {
      newIndex = 0
    }
    setViewedNoteIndex(newIndex)
  }

  function openViewedNote() {
    router.push(`/note?id=${viewedNoteData.noteId}`)
  }

  return (
    <>
      <Button
        onClick={openViewedNote}
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          paddingY: 0,
          paddingLeft: [2, 3],
          backgroundColor: 'whiteAlpha.3',
          borderRadius: 0
        }}
      >
        <SmartEmoji nativeEmoji={viewedNoteData.metadata.icon} rem={1.2} />
        <Text
          type="span"
          sx={{
            paddingLeft: [2, 3],
            paddingY: '2px',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            textAlign: 'left'
          }}
        >
          {viewedNoteData.metadata.title}
        </Text>
      </Button>
      {cellNotesData.length > 1 && (
        <NoteChanger
          currentIndex={viewedNoteIndex}
          totalNotes={cellNotesData.length}
          change={changeViewedNote}
        />
      )}
    </>
  )
}

interface NoteChangerProps { currentIndex: number, totalNotes: number, change: (delta: 1 | -1) => void }
const NoteChanger = ({ currentIndex, totalNotes, change }: NoteChangerProps) => {
  return (
    <Flex
      center
      sx={{
        alignSelf: 'stretch',
        height: '100%',
        borderLeft: 'solid 1px',
        borderColor: 'grid',
        '& button': {
          paddingX: '0.5rem',
          paddingY: 0,
          height: '100%',
          borderRadius: 0,
          backgroundColor: 'transparent',
          color: 'notes',
          filter: 'brightness(1.2)',
          '&:first-of-type': {
            borderRight: 'solid 1px',
            borderColor: 'grid'
          },
          '&:last-of-type': {
            borderLeft: 'solid',
            borderLeftWidth: [0, '1px'],
            borderColor: 'grid'
          }
        }
      }}
    >
      <IconButton icon={ChevronLeftIcon} onClick={() => change(-1)} />
      <Text
        type="span"
        sx={{
          letterSpacing: '0.15ch',
          fontVariantNumeric: 'tabular-nums',
          display: ['none', 'block'],
          paddingX: 3
        }}
      >
        {currentIndex + 1}/{totalNotes}
      </Text>
      <IconButton icon={ChevronRightIcon} onClick={() => change(1)} />
    </Flex>
  )
}

const AddNoteButton = ({ habitId, disabled }: { habitId: string, disabled: boolean }) => {
  return (
    <NextLink href={`/note?habitId=${habitId}`}>
      <IconButton
        icon={PlusIcon}
        disabled={disabled}
        sx={{
          height: '100%',
          width: '2.25rem',
          marginLeft: 'auto',
          paddingY: 0,
          paddingX: '0.6rem',
          color: 'notes',
          backgroundColor: 'transparent',
          borderRadius: 0,
          borderLeft: 'solid 1px',
          borderColor: 'grid',
          filter: 'brightness(1.2)'
        }}
      />
    </NextLink>
  )
}

export default NotesRow