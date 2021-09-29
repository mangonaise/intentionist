import { ActiveIcon, ArchiveIcon, PauseIconOutline } from '@/components/icons'
import { Flex, IconButton, Spacer } from '@/components/primitives'
import { HabitStatus } from '@/lib/logic/app/HabitsHandler'
import { observer } from 'mobx-react-lite'
import { HabitEditorContext } from 'pages/habits/[id]'
import { useContext } from 'react'

const buttonData: Array<{ status: HabitStatus, text: string, icon: () => JSX.Element }> = [
  { status: 'active', text: 'Active', icon: ActiveIcon },
  { status: 'suspended', text: 'Suspended', icon: PauseIconOutline },
  { status: 'archived', text: 'Archived', icon: ArchiveIcon }
]

const HabitStatusPicker = () => {
  const editor = useContext(HabitEditorContext)

  return (
    <Flex flexWrap={['wrap', 'nowrap']}>
      {buttonData.map((data, index) => (
        <IconButton
          icon={data.icon}
          onClick={() => editor.updateHabit({ ...editor.habit!, status: data.status})}
          flex={['', 1]}
          width={['100%', 'auto']}
          mr={[0, index < 2 ? 3 : 0]}
          mb={[index < 2 ? 2 : 0, 0]}
          bg={data.status === editor.habit?.status ? 'text' : ''}
          color={data.status === editor.habit?.status ? 'bg' : 'whiteAlpha.30'}
          fontWeight="medium"
          key={data.status}
        >
          {data.text}
          <Spacer mr={['auto', '0']} />
        </IconButton>
      ))}
    </Flex>
  )
}

export default observer(HabitStatusPicker)