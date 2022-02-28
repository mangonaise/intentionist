import { Emoji, getEmojiDataFromNative } from 'emoji-mart'
import allEmojiData from 'emoji-mart/data/all.json'
import isWindowsOS from '@/logic/utils/isWindowsOS'
import Text from '@/components/primitives/Text'

interface Props {
  nativeEmoji: string
  rem: number
}

const SmartEmoji = ({ nativeEmoji, rem }: Props) => {  
  if (isWindowsOS) {
    const emojiData = getEmojiDataFromNative(nativeEmoji, 'twitter', allEmojiData)
    if (emojiData) {
      const twemojiSize = rem * 14
      return (
        <Text 
          type="span"
          aria-label={nativeEmoji}
          sx={{
            display: 'inline-flex',
            justifyContent: 'center',
            alignItems: 'center',
            size: `${twemojiSize}px`,
            '& span': { size: `${twemojiSize}px` }
          }}
        >
          <Emoji
            
            emoji={emojiData}
            size={twemojiSize}
            set="twitter"
            sheetSize={32}
            skin={emojiData.skin || undefined}
          />
        </Text >
      )
    }
  }
  return (
    <Text
      type="span"
      aria-label={nativeEmoji}
      sx={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        size: `${rem}rem`,
        fontSize: `${rem}rem` || 'inherit'
      }}
    >
      {nativeEmoji}
    </Text >
  )
}

export default SmartEmoji