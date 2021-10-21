import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { HabitStatus } from '@/lib/logic/app/HabitsHandler'
import { HabitEditorContext } from 'pages/habits/[id]'
import Flex from '@/components/primitives/Flex'
import IconButton from '@/components/primitives/IconButton'
import Spacer from '@/components/primitives/Spacer'
import ActiveIcon from '@/components/icons/ActiveIcon'
import ArchiveIcon from '@/components/icons/ArchiveIcon'
import PauseOutlineIcon from '@/components/icons/PauseOutlineIcon'

const buttonData: Array<{ status: HabitStatus, text: string, icon: () => JSX.Element }> = [
  { status: 'active', text: 'Active', icon: ActiveIcon },
  { status: 'suspended', text: 'Suspended', icon: PauseOutlineIcon },
  { status: 'archived', text: 'Archived', icon: ArchiveIcon }
]

const HabitStatusPicker = () => {
  const editor = useContext(HabitEditorContext)

  return (
    <Flex sx={{ flexWrap: ['wrap', 'nowrap'] }}>
      {buttonData.map((data, index) => {
        const isSelected = data.status === editor.habit?.status
        return (
          <IconButton
            icon={data.icon}
            onClick={() => editor.updateHabit({ status: data.status })}
            hoverEffect={isSelected ? 'none' : 'default'}
            sx={{
              flex: [null, 1],
              width: ['100%', 'auto'],
              mr: [0, index < 2 ? 3 : 0],
              mb: [index < 2 ? 2 : 0, 0],
              bg: isSelected ? 'text' : '',
              color: isSelected ? 'bg' : 'whiteAlpha.30',
              fontWeight: "medium"
            }}
            key={data.status}
          >
            {data.text}
            <Spacer mr={['auto', '0']} />
          </IconButton>
        )
      })}
    </Flex>
  )
}

export default observer(HabitStatusPicker)