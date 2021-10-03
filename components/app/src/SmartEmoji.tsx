import { Text } from '@/components/primitives'
import { Emoji, getEmojiDataFromNative } from 'emoji-mart'
import emojiData from 'emoji-mart/data/all.json'
import isWindowsOS from '@/lib/logic/utils/isWindowsOS'

const SmartEmoji = ({ nativeEmoji, twemojiSize }: { nativeEmoji: string, twemojiSize: number }) => {
  if (isWindowsOS) {
    const twemoji = getEmojiDataFromNative(nativeEmoji, 'twitter', emojiData)
    return (
      <Emoji emoji={twemoji} size={twemojiSize} set="twitter" sheetSize={32} />
    )
  } else {
    return (
      <Text as="span">
        {nativeEmoji}
      </Text>
    )
  }

}

export default SmartEmoji