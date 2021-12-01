import { observer } from 'mobx-react-lite'
import { container } from 'tsyringe'
import { Fragment, useState } from 'react'
import HabitsHandler, { HabitPreset, habitPresets } from '@/logic/app/HabitsHandler'
import SmartEmoji from '@/components/app/SmartEmoji'
import Dropdown from '@/components/app/Dropdown'
import Box from '@/components/primitives/Box'
import Flex from '@/components/primitives/Flex'
import Text from '@/components/primitives/Text'
import Spacer from '@/components/primitives/Spacer'
import IconButton from '@/components/primitives/IconButton'
import PlusIcon from '@/components/icons/PlusIcon'

interface Props {
  onSelectPreset: (preset: HabitPreset) => void
}

const HabitPresetsList = observer(({ onSelectPreset }: Props) => {
  const { activeHabits } = container.resolve(HabitsHandler)

  const presetsToDisplay = habitPresets.filter((preset) => {
    for (const habit of Object.values(activeHabits)) {
      if (habit.name.toLowerCase().includes(preset.uniqueText?.toLowerCase() ?? preset.name.toLowerCase())) {
        return false
      }
    }
    return true
  })

  return (
    <Box>
      {presetsToDisplay.map((preset) => (
        <Preset preset={preset} onSelectPreset={onSelectPreset} key={preset.name} />
      ))}
    </Box>
  )
})

const Preset = ({ preset, onSelectPreset }: { preset: HabitPreset } & Props) => {
  const [presetOptions] = useState(preset.name.indexOf('[') > -1 && preset.name.match(/\[(.*)\]/)?.[1].split(','))
  const [selectedPresetOption, setSelectedPresetOption] = useState<string | null>(null)
  const [segments] = useState(
    presetOptions
      ? preset.name.match(/(.*)(\[.*\])(.*)/)?.slice(1, 4)
      : [preset.name]
  )

  function handleSelectPreset() {
    const habitName = presetOptions && segments
      ? `${segments[0]}${selectedPresetOption}${segments[2]}`
      : preset.name
    onSelectPreset({ ...preset, name: habitName })
  }

  if (!segments) {
    console.error('Something went wrong when processing habit preset:', preset.name)
    return null
  }

  return (
    <Flex align="center" sx={{ mb: 2 }}>
      <IconButton
        icon={PlusIcon}
        onClick={handleSelectPreset}
        sx={{ mr: 3 }}
        disabled={presetOptions && !selectedPresetOption}
      />
      <Flex center sx={{ width: '1.2rem' }}>
        <SmartEmoji nativeEmoji={preset.icon} rem={1.2} />
      </Flex>
      <Spacer ml={3} />
      {segments.map((segment, index) => {
        return (
          <Fragment key={index}>
            {index === 1 && presetOptions
              ? (<Dropdown title={<Text type="span" sx={{ minWidth: '1.15rem' }}>{selectedPresetOption ?? '...'}</Text>} sx={{ mx: 2 }}>
                {presetOptions.map((option) => (
                  <Dropdown.Item itemAction={() => setSelectedPresetOption(option)} key={option}>
                    {option}
                  </Dropdown.Item>
                ))}
              </Dropdown>)
              : (<Text type="span" sx={{ color: index === 1 ? 'lightcoral' : null }}>
                {segment}
              </Text>)
            }
          </Fragment>
        )
      })}
    </Flex>
  )
}

export default HabitPresetsList