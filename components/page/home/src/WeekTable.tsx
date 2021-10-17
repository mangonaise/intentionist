import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { FC, Fragment, useLayoutEffect } from 'react'
import { Grid } from '@/components/primitives'
import { ViewHabitsButton } from '..'
import { CondensedViewAlert, CondenseViewToggle, HabitCell, TrackerStatusCell, JournalCell, WeekTableTitleRow } from './table'
import WeekHandler, { WeekdayId, WeekViewMode } from '@/lib/logic/app/WeekHandler'

const WeekTable = () => {
  const { habitsInView, viewMode, refreshHabitsInView } = container.resolve(WeekHandler)

  useLayoutEffect(() => {
    refreshHabitsInView()
  }, [refreshHabitsInView])

  return (
    <Table>
      <CondenseViewToggle />
      <WeekTableTitleRow />
      {habitsInView.map((habit) => (
        <Fragment key={habit.id}>
          <HabitCell habit={habit} />
          {viewMode === 'tracker' ?
            Array.from({ length: 7 }).map((_, weekdayId) => (
              <TrackerStatusCell
                habitId={habit.id}
                weekday={weekdayId as WeekdayId}
                key={weekdayId}
              />
            ))
            : viewMode === 'journal' ? (
              <JournalCell habitId={habit.id} />
            ) : <div />
          }
        </Fragment>
      ))}
      <CondensedViewAlert />
      <ViewHabitsButton />
    </Table>
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