import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { useContext, useState } from 'react'
import { BaseEmoji } from 'emoji-mart'
import { HomePageContext } from 'pages/home'
import WeekIconsHandler from '@/logic/app/WeekIconsHandler'
import WeekInView from '@/logic/app/WeekInView'
import EmojiPicker from '@/components/app/EmojiPicker'
import Dropdown from '@/components/app/Dropdown'
import SmartEmoji from '@/components/app/SmartEmoji'
import Icon from '@/components/primitives/Icon'
import Flex from '@/components/primitives/Flex'
import PencilIcon from '@/components/icons/PencilIcon'

const WeekIconDropdown = observer(() => {
  const { weekData: { icon }, friendUid, isLoadingWeek } = container.resolve(WeekInView)
  const { setIcon, removeIcon } = container.resolve(WeekIconsHandler)
  const { narrow } = useContext(HomePageContext)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  function handleSelectEmoji(emoji: BaseEmoji) {
    setIcon(emoji.native)
  }

  if (!icon && friendUid) {
    return null
  }

  return (
    <>
      <Dropdown
        title={<DropdownTitle />}
        anchorRight={narrow}
        disabled={isLoadingWeek || !!friendUid}
        noArrow={!!friendUid}
        sx={{
          marginLeft: 2,
          '& button:disabled': friendUid ? {
            opacity: 1,
            backgroundColor: 'transparent',
            paddingX: 2
          } : {}
        }}
      >
        <Dropdown.Item itemAction={() => setShowEmojiPicker(true)}>
          {!!icon ? 'Change' : 'Add'} week icon
        </Dropdown.Item>
        {!!icon && (
          <Dropdown.Item itemAction={removeIcon}>
            Remove week icon
          </Dropdown.Item>
        )}
      </Dropdown>
      <EmojiPicker
        isOpen={showEmojiPicker}
        onClosePicker={() => setShowEmojiPicker(false)}
        label="as your week's icon"
        onSelectEmoji={handleSelectEmoji}
      />
    </>
  )
})

const DropdownTitle = observer(() => {
  const { weekData: { icon }} = container.resolve(WeekInView)

  if (icon) {
    return (
      <Flex center sx={{ transform: 'scale(1.2)' }}>
        <SmartEmoji nativeEmoji={icon} rem={1} />
      </Flex>
    )
  }

  return <Icon icon={PencilIcon} />
})

export default WeekIconDropdown