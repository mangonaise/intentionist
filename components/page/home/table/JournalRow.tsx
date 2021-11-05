import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { useRouter } from 'next/router'
import WeekHandler, { JournalEntryMetadata } from '@/logic/app/WeekHandler'
import SmartEmoji from '@/components/app/SmartEmoji'
import Button from '@/components/primitives/Button'
import Flex from '@/components/primitives/Flex'
import IconButton from '@/components/primitives/IconButton'
import Text from '@/components/primitives/Text'
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon'
import ChevronRightIcon from '@/components/icons/ChevronRightIcon'
import PlusIcon from '@/components/icons/PlusIcon'
import NextLink from 'next/link'

const JournalRow = ({ habitId }: { habitId: string }) => {
  const { isLoadingWeek, getJournalEntryDataForHabit } = container.resolve(WeekHandler)
  const cellEntriesData = isLoadingWeek ? [] : getJournalEntryDataForHabit(habitId)

  return (
    <Flex
      align="center"
      sx={{ borderTop: 'solid 1px', borderLeft: 'solid 1px', borderColor: 'grid' }}
    >
      {cellEntriesData.length > 0 && <JournalEntryPreview cellEntriesData={cellEntriesData} />}
      <AddEntryButton habitId={habitId} />
    </Flex>
  )
}

const JournalEntryPreview = ({ cellEntriesData }: { cellEntriesData: Array<{ entryId: string, metadata: JournalEntryMetadata }> }) => {
  const router = useRouter()
  const { weekInView: { startDate }, latestWeekStartDate } = container.resolve(WeekHandler)
  const isViewingLatestWeek = startDate === latestWeekStartDate
  const [viewedEntryIndex, setViewedEntryIndex] = useState(isViewingLatestWeek ? cellEntriesData.length - 1 : 0)
  const viewedEntryData = cellEntriesData[viewedEntryIndex]

  function changeViewedEntry(delta: 1 | -1) {
    let newIndex = viewedEntryIndex + delta
    if (newIndex < 0) {
      newIndex = cellEntriesData.length - 1
    } else if (newIndex > cellEntriesData.length - 1) {
      newIndex = 0
    }
    setViewedEntryIndex(newIndex)
  }

  function openViewedEntry() {
    router.push(`/journal/${viewedEntryData.entryId}`)
  }

  return (
    <>
      <Button
        onClick={openViewedEntry}
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
        <SmartEmoji nativeEmoji={viewedEntryData.metadata.icon} rem={1.2} />
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
          {viewedEntryData.metadata.title}
        </Text>
      </Button>
      {cellEntriesData.length > 1 && (
        <EntryChanger
          currentIndex={viewedEntryIndex}
          totalEntries={cellEntriesData.length}
          change={changeViewedEntry}
        />
      )}
    </>
  )
}

interface EntryChangerProps { currentIndex: number, totalEntries: number, change: (delta: 1 | -1) => void }
const EntryChanger = ({ currentIndex, totalEntries, change }: EntryChangerProps) => {
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
          color: 'journal',
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
        {currentIndex + 1}/{totalEntries}
      </Text>
      <IconButton icon={ChevronRightIcon} onClick={() => change(1)} />
    </Flex>
  )
}

const AddEntryButton = ({ habitId }: { habitId: string }) => {
  return (
    <NextLink href={`/journal/new?habitId=${habitId}`}>
      <IconButton
        icon={PlusIcon}
        sx={{
          height: '100%',
          width: '2.25rem',
          marginLeft: 'auto',
          paddingY: 0,
          paddingX: '0.6rem',
          color: 'journal',
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

export default observer(JournalRow)