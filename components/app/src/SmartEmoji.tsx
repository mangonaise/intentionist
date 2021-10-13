import { Text } from '@/components/primitives'
import { Emoji, getEmojiDataFromNative } from 'emoji-mart'
import emojiData from 'emoji-mart/data/all.json'
import isWindowsOS from '@/lib/logic/utils/isWindowsOS'

interface Props {
  nativeEmoji: string,
  nativeFontSize?: string,
  twemojiSize: number
}

const SmartEmoji = ({ nativeEmoji, nativeFontSize, twemojiSize }: Props) => {
  if (isWindowsOS) {
    const twemoji = getEmojiDataFromNative(nativeEmoji, 'twitter', emojiData)
    if (twemoji) {
      return (
        <Text type="span" sx={{ height: `${twemojiSize}px`}}>
          <Emoji emoji={twemoji} size={twemojiSize} set="twitter" sheetSize={32} skin={twemoji.skin || undefined} />
        </Text>
      )
    }
  }
  return (
    <Text type="span" sx={{ fontSize: nativeFontSize || 'inherit' }}>
      {nativeEmoji}
    </Text >
  )
}

export default SmartEmoji