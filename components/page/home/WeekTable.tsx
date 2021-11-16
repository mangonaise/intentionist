import { container } from 'tsyringe'
import { makeAutoObservable } from 'mobx'
import { observer } from 'mobx-react-lite'
import { createContext, FC, Fragment, useEffect, useLayoutEffect, useRef } from 'react'
import WeekHandler, { WeekdayId, WeekViewMode } from '@/logic/app/WeekHandler'
import HabitsHandler from '@/logic/app/HabitsHandler'
import useMediaQuery from '@/hooks/useMediaQuery'
import Grid from '@/components/primitives/Grid'
import CondensedViewAlert from './table/CondensedViewAlert'
import CondenseViewToggle from './table/CondenseViewToggle'
import FocusedTimeRow from './table/FocusedTimeRow'
import HabitCell from './table/HabitCell'
import TrackerStatusCell from './table/TrackerStatusCell'
import NotesRow from './table/NotesRow'
import WeekTableColumnTitles from './table/WeekTableColumnTitles'
import ViewHabitsButton from './ViewHabitsButton'

class ColumnsDisplayHandler {
  weekdayId = 0 as WeekdayId
  collapseColumns = false
  showHabitNames = true
  constructor() { makeAutoObservable(this) }
  public setWeekdayId = (weekday: WeekdayId) => { this.weekdayId = weekday }
  public setCollapseColumns = (collapse: boolean) => { this.collapseColumns = collapse }
  public setShowHabitNames = (show: boolean) => { this.showHabitNames = show }
}

export const ColumnsDisplayContext = createContext<ColumnsDisplayHandler>(null!)

const WeekTable = () => {
  const { viewMode, weekInView: { habitsInView, refreshHabitsInView, friendUid } } = container.resolve(WeekHandler)
  const columnsDisplayHandler = useRef(new ColumnsDisplayHandler())
  const showHabitNames = useMediaQuery('(max-width: 500px)', false, true)

  useWeekTableArrowNavigation()

  useLayoutEffect(() => {
    if (!friendUid) {
      refreshHabitsInView(container.resolve(HabitsHandler).habits)
    }
  }, [])

  useLayoutEffect(() => {
    columnsDisplayHandler.current.setShowHabitNames(showHabitNames)
  }, [showHabitNames])

  function getRowContent(habitId: string, rowIndex: number) {
    switch (viewMode) {
      case 'tracker':
        return Array.from({ length: 7 }).map((_, weekdayId) => (
          <TrackerStatusCell
            habitId={habitId}
            weekday={weekdayId as WeekdayId}
            rowIndex={rowIndex}
            key={weekdayId}
          />
        ))
      case 'notes':
        return <NotesRow habitId={habitId} />
      case 'focus':
        return <FocusedTimeRow habitId={habitId} />
    }
  }

  return (
    <ColumnsDisplayContext.Provider value={columnsDisplayHandler.current}>
      <Table>
        <CondenseViewToggle />
        <WeekTableColumnTitles />
        {habitsInView.map((habit, rowIndex) => (
          <Fragment key={habit.id}>
            <HabitCell habit={habit} />
            {getRowContent(habit.id, rowIndex)}
          </Fragment>
        ))}
        <CondensedViewAlert />
        <ViewHabitsButton />
      </Table>
    </ColumnsDisplayContext.Provider>
  )
}

const Table: FC = observer(({ children }) => {
  const { viewMode, isLoadingWeek } = container.resolve(WeekHandler)
  const templateColumnsMap: { [key in WeekViewMode]: string } = {
    tracker: 'auto repeat(7, minmax(2.5ch, 1fr))',
    notes: 'auto 1fr',
    focus: 'auto 1fr'
  }

  return (
    <Grid
      sx={{
        gridTemplateColumns: templateColumnsMap[viewMode],
        marginX: ['-0.5rem', 0],
        opacity: isLoadingWeek ? 0.5 : 1,
        pointerEvents: isLoadingWeek ? 'none' : 'auto',
        transition: 'opacity 100ms',
        '& button': { minHeight: 'row' }
      }}
    >
      {children}
    </Grid>
  )
})

function useWeekTableArrowNavigation() {
  function handleArrowNavigation(coords: [number, number]) {
    const focusedElementId = document.activeElement?.id
    if (focusedElementId?.includes('cell')) {
      let [row, col] = focusedElementId.split('-')[1]?.split(',').map((coord) => parseInt(coord))
      if (row !== NaN && col !== NaN) {
        row += coords[0]
        col += coords[1]
        const cellElement = document.getElementById(`cell-${row},${col}`)
        if (cellElement) {
          cellElement.focus()
        }
      }
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    const deltaCoords = ({
      'ArrowUp': [0, -1],
      'w': [0, -1],
      'ArrowRight': [1, 0],
      'd': [1, 0],
      'ArrowDown': [0, 1],
      's': [0, 1],
      'ArrowLeft': [-1, 0],
      'a': [-1, 0]
    } as { [key: string]: [number, number] })[e.key]
    if (deltaCoords) {
      handleArrowNavigation(deltaCoords)
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
}

export default observer(WeekTable)