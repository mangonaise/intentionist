import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { FC, Fragment } from 'react'
import { Flex, Grid } from '@/components/primitives'
import { ViewHabitsButton } from '..'
import { HabitCell, TrackerStatusCell, WeekdayRow } from './table'
import WeekHandler, { WeekdayId } from '@/lib/logic/app/WeekHandler'

const WeekTable = () => {
  const { habitsInView, isLoadingWeek } = container.resolve(WeekHandler)

  return (
    <Table isLoading={isLoadingWeek}>
      <Flex center sx={{ height: 'row', borderBottom: 'solid 1px', borderColor: 'grid' }} />
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
      <ViewHabitsButton />
    </Table>
  )
}

const Table: FC<{ isLoading: boolean }> = ({ children, isLoading }) => {
  return (
    <Grid
      sx={{
        gridTemplateColumns: 'auto repeat(7, minmax(2.5ch, 1fr))',
        marginX: ['-1rem', 0],
        opacity: isLoading ? 0.5 : 1,
        transition: 'opacity 100ms'
      }}
    >
      {children}
    </Grid>
  )
}

export default observer(WeekTable)