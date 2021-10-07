import { container } from 'tsyringe'
import { Fragment } from 'react'
import { CenteredFlex, Grid } from '@/components/primitives'
import { ViewHabitsButton } from '..'
import { HabitCell, TrackerStatusCell, WeekdayCells } from './table'
import WeekHandler, { WeekdayId } from '@/lib/logic/app/WeekHandler'

const WeekTable = () => {
  const { habitsInView, weekInView } = container.resolve(WeekHandler)

  return (
    <Grid gridTemplateColumns="auto repeat(7, minmax(2.5ch, 1fr))" mx={['-1rem', 0]}>
      <CenteredFlex height="row" borderBottom="solid 1px" borderColor="grid"></CenteredFlex>
      <WeekdayCells />
      {habitsInView.map((habit) => (
        <Fragment key={habit.id}>
          <HabitCell habit={habit} />
          {Array.from({ length: 7 }).map((_, weekdayId) => (
            <TrackerStatusCell
              habitId={habit.id}
              weekday={weekdayId as WeekdayId}
              initialStatus={weekInView.statuses[habit.id]?.[weekdayId as WeekdayId] ?? []}
              key={weekdayId}
            />
          ))}
        </Fragment>
      ))}
      <ViewHabitsButton />
    </Grid>
  )
}

export default WeekTable