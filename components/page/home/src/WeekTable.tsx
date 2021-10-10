import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { FC, Fragment, useLayoutEffect } from 'react'
import { Grid } from '@/components/primitives'
import { ViewHabitsButton } from '..'
import { CondensedViewAlert, CondenseViewToggle, HabitCell, TrackerStatusCell, WeekdayRow } from './table'
import WeekHandler, { WeekdayId } from '@/lib/logic/app/WeekHandler'

const WeekTable = () => {
  const { habitsInView, refreshHabitsInView } = container.resolve(WeekHandler)

  useLayoutEffect(() => {
    refreshHabitsInView()
  }, [])

  return (
    <Table>
      <CondenseViewToggle />
      <WeekdayRow />
      {habitsInView.map((habit) => (
        <Fragment key={habit.id}>
          <HabitCell habit={habit} />
          {Array.from({ length: 7 }).map((_, weekdayId) => (
            <TrackerStatusCell
              habitId={habit.id}
              weekday={weekdayId as WeekdayId}
              key={weekdayId}
            />
          ))}
        </Fragment>
      ))}
      <CondensedViewAlert />
      <ViewHabitsButton />
    </Table>
  )
}

const Table: FC = observer(({ children }) => {
  const { isLoadingWeek } = container.resolve(WeekHandler)

  return (
    <Grid
      sx={{
        gridTemplateColumns: 'auto repeat(7, minmax(2.5ch, 1fr))',
        marginX: ['-1rem', 0],
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