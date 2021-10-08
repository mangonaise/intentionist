import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { Fragment } from 'react'
import { CenteredFlex, Grid } from '@/components/primitives'
import { ViewHabitsButton } from '..'
import { HabitCell, TrackerStatusCell, WeekdayCells } from './table'
import WeekHandler, { WeekdayId } from '@/lib/logic/app/WeekHandler'
import styled from '@emotion/styled'
import css from '@styled-system/css'

const WeekTable = () => {
  const { habitsInView, isLoadingWeek } = container.resolve(WeekHandler)

  return (
    <Table isLoading={isLoadingWeek}>
      <CenteredFlex height="row" borderBottom="solid 1px" borderColor="grid"></CenteredFlex>
      <WeekdayCells />
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


const Table = styled(Grid)<{ isLoading: boolean }>(({ isLoading }) => css({
  gridTemplateColumns: 'auto repeat(7, minmax(2.5ch, 1fr))',
  marginX: ['-1rem', 0],
  opacity: isLoading ? 0.5 : 1,
  transition: 'opacity 100ms'
}))

export default observer(WeekTable)