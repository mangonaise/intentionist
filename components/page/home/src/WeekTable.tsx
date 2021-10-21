import { container } from 'tsyringe'
import { makeAutoObservable } from 'mobx'
import { observer } from 'mobx-react-lite'
import { createContext, FC, Fragment, useLayoutEffect, useRef } from 'react'
import { Grid } from '@/components/primitives'
import { ViewHabitsButton } from '..'
import { CondensedViewAlert, CondenseViewToggle, FocusedTimeRow, HabitCell, TrackerStatusCell, JournalRow, WeekTableColumnTitles } from './table'
import WeekHandler, { WeekdayId, WeekViewMode } from '@/lib/logic/app/WeekHandler'

class ColumnsDisplayHandler {
  weekdayId = 0 as WeekdayId
  collapseColumns = false
  constructor() { makeAutoObservable(this) }
  public setWeekdayId = (weekday: WeekdayId) => { this.weekdayId = weekday }
  public setCollapseColumns = (collapse: boolean) => { this.collapseColumns = collapse }
}

export const ColumnsDisplayContext = createContext<ColumnsDisplayHandler>(null!)

const WeekTable = () => {
  const { habitsInView, viewMode, refreshHabitsInView } = container.resolve(WeekHandler)
  const columnsDisplayHandler = useRef(new ColumnsDisplayHandler())

  useLayoutEffect(() => {
    refreshHabitsInView()
  }, [refreshHabitsInView])

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
        transition: 'opacity 100ms'
      }}
    >
      {children}
    </Grid>
  )
})

export default observer(WeekTable)