import { Emoji, getEmojiDataFromNative } from 'emoji-mart'
import emojiData from 'emoji-mart/data/all.json'
import isWindowsOS from '@/lib/logic/utils/isWindowsOS'
import Text from '@/components/primitives/Text'

interface Props {
  nativeEmoji: string,
  rem: number
}

const SmartEmoji = ({ nativeEmoji, rem }: Props) => {
  if (isWindowsOS) {
    const twemoji = getEmojiDataFromNative(nativeEmoji, 'twitter', emojiData)
    if (twemoji) {
      const twemojiSize = rem * 14
      return (
        <Text type="span" sx={{ height: `${twemojiSize}px`, '& span': { maxHeight: `${twemojiSize}px`} }}>
          <Emoji emoji={twemoji} size={twemojiSize} set="twitter" sheetSize={32} skin={twemoji.skin || undefined} />
        </Text>
      )
    }
  }
  return (
    <Text type="span" sx={{ fontSize: `${rem}rem` || 'inherit' }}>
      {nativeEmoji}
    </Text >
  )
}

export default SmartEmoji