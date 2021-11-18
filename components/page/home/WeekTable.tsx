import { container } from 'tsyringe'
import { makeAutoObservable } from 'mobx'
import { observer } from 'mobx-react-lite'
import { createContext, FC, Fragment, useEffect, useLayoutEffect, useRef } from 'react'
import { Habit } from '@/logic/app/HabitsHandler'
import WeekInView, { WeekViewMode, WeekdayId } from '@/logic/app/WeekInView'
import useMediaQuery from '@/hooks/useMediaQuery'
import Grid from '@/components/primitives/Grid'
import CondensedViewAlert from './table/CondensedViewAlert'
import CondenseViewToggle from './table/CondenseViewToggle'
import HabitCell from './table/HabitCell'
import TrackerStatusRow from './table/TrackerStatusRow'
import NotesRow from './table/NotesRow'
import FocusedTimeRow from './table/FocusedTimeRow'
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
  const { viewMode, habitsInView } = container.resolve(WeekInView)
  const columnsDisplayHandler = useRef(new ColumnsDisplayHandler())
  const showHabitNames = useMediaQuery('(max-width: 500px)', false, true)

  useWeekTableArrowNavigation()

  useLayoutEffect(() => {
    columnsDisplayHandler.current.setShowHabitNames(showHabitNames)
  }, [showHabitNames])

  return (
    <ColumnsDisplayContext.Provider value={columnsDisplayHandler.current}>
      <Table>
        <CondenseViewToggle />
        <WeekTableColumnTitles />
        {habitsInView.map((habit, rowIndex) => {
          const readonly = !!habit.friendUid
          return (
            <Fragment key={habit.id}>
              <HabitCell habit={habit} />
              {getRowContent(viewMode, habit, readonly, rowIndex)}
            </Fragment>
          )
        })}
        <CondensedViewAlert />
        <ViewHabitsButton />
      </Table>
    </ColumnsDisplayContext.Provider>
  )
}

function getRowContent(viewMode: WeekViewMode, habit: Habit, readonly: boolean, rowIndex: number) {
  switch (viewMode) {
    case 'tracker':
      return <TrackerStatusRow habitId={habit.id} readonly={readonly} rowIndex={rowIndex} />
    case 'notes':
      return <NotesRow habit={habit} readonly={readonly} />
    case 'focus':
      return <FocusedTimeRow habitId={habit.id} readonly={readonly} />
  }
}

const Table: FC = observer(({ children }) => {
  const { isLoadingWeek } = container.resolve(WeekInView)

  return (
    <Grid
      sx={{
        gridTemplateColumns: 'auto 1fr',
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