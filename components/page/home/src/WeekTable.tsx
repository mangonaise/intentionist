import { CenteredFlex, Grid } from '@/components/primitives'
import { Fragment } from 'react'
import { ViewHabitsButton } from '..'
import { HabitCell, StatusCell, WeekdayCells } from './table'

const WeekTable = () => {
  return (
    <Grid gridTemplateColumns="auto repeat(7, minmax(2.5ch, 1fr))" mx={['-1rem', 0]}>
      <CenteredFlex height="row" borderBottom="solid 1px" borderColor="grid"></CenteredFlex>
      <WeekdayCells />
      {Array.from({ length: 5 }).map((_, index) => (
        <Fragment key={index}>
          <HabitCell />
          {Array.from({ length: 7 }).map((_, index) => <StatusCell key={index} />)}
        </Fragment>
      ))}
      <ViewHabitsButton />
    </Grid>
  )
}

export default WeekTable