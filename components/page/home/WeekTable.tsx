import { container } from 'tsyringe'
import { makeAutoObservable } from 'mobx'
import { observer } from 'mobx-react-lite'
import { createContext, FC, Fragment, useLayoutEffect, useRef } from 'react'
import WeekHandler, { WeekdayId, WeekViewMode } from '@/lib/logic/app/WeekHandler'
import useMediaQuery from '@/lib/hooks/useMediaQuery'
import Grid from '@/components/primitives/Grid'
import CondensedViewAlert from './table/CondensedViewAlert'
import CondenseViewToggle from './table/CondenseViewToggle'
import FocusedTimeRow from './table/FocusedTimeRow'
import HabitCell from './table/HabitCell'
import TrackerStatusCell from './table/TrackerStatusCell'
import JournalRow from './table/JournalRow'
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
  const { habitsInView, viewMode, refreshHabitsInView } = container.resolve(WeekHandler)
  const columnsDisplayHandler = useRef(new ColumnsDisplayHandler())
  const showHabitNames = useMediaQuery('(max-width: 500px)', false, true)

  useLayoutEffect(() => {
    refreshHabitsInView()
  }, [refreshHabitsInView])

  useLayoutEffect(() => {
    columnsDisplayHandler.current.setShowHabitNames(showHabitNames)
  }, [showHabitNames])

  function getRowContent(habitId: string) {
    switch (viewMode) {
      case 'tracker':
        return Array.from({ length: 7 }).map((_, weekdayId) => (
          <TrackerStatusCell
            habitId={habitId}
            weekday={weekdayId as WeekdayId}
            key={weekdayId}
          />
        ))
      case 'journal':
        return <JournalRow habitId={habitId} />
      case 'focus':
        return <FocusedTimeRow habitId={habitId} />
    }
  }

  return (
    <ColumnsDisplayContext.Provider value={columnsDisplayHandler.current}>
      <Table>
        <CondenseViewToggle />
        <WeekTableColumnTitles />
        {habitsInView.map((habit) => (
          <Fragment key={habit.id}>
            <HabitCell habit={habit} />
            {getRowContent(habit.id)}
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
    journal: 'auto 1fr',
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

export default observer(WeekTable)