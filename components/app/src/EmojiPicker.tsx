import 'emoji-mart/css/emoji-mart.css'
import { useLayoutEffect, useRef, useState } from 'react'
import { BaseEmoji, Picker } from 'emoji-mart'
import isWindowsOS from '@/lib/logic/utils/isWindowsOS'
import styled from '@emotion/styled'
import css from '@styled-system/css'

interface Props {
  display: boolean,
  label: string,
  onSelect: (emoji: BaseEmoji) => void,
  onClose: () => void
}

const EmojiPicker = ({ display, label, onSelect, onClose: forceClose }: Props) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [anchorRight, setAnchorRight] = useState(false)

  useLayoutEffect(() => {
    if (display) {
      const wrapper = wrapperRef.current!
      setAnchorRight(wrapper.parentElement!.offsetLeft + wrapper.offsetWidth > window.innerWidth)
    }
  }, [display])

  function handleKeyDown(key: string) {
    if (key === 'Escape') {
      forceClose()
    }
  }

  function handleSelect(emoji: BaseEmoji) {
    onSelect(emoji)
  }

  if (!display) return null
  return (
    <EmojiMartWrapper
      onKeyDown={e => handleKeyDown(e.key)}
      ref={wrapperRef}
      style={anchorRight ? { right: 0 } : {}}
    >
      <Picker
        onSelect={(emoji: BaseEmoji) => handleSelect(emoji)}
        native={!isWindowsOS}
        theme="dark"
        set="twitter"
        emojiSize={26}
        sheetSize={32}
        showPreview={false}
        title={label}
        emoji=""
        color="var(--text-color)"
        notFoundEmoji=""
        exclude={['recent']}
      />
    </EmojiMartWrapper>
  )
}

const EmojiMartWrapper = styled.div(css({
  position: 'absolute',
  zIndex: 1,
  '.emoji-mart': {
    opacity: 0,
    animation: 'fade-in forwards 200ms',
    backgroundColor: 'bg',
    border: 'solid 2px',
    borderColor: 'divider',
    transform: 'translateY(4px)',
    fontFamily: 'inherit',

    '@media screen and (max-width: 400px)': {
      width: '100vw !important',
      position: 'fixed',
      left: 0,
      right: 0
    },

    '&-bar': {
      borderColor: 'divider',
      '&:first-of-type': {
        borderBottomWidth: '2px'
      },
      '&:last-child': {
        borderTopWidth: '2px'
      }
    },

    '&-search': {
      zIndex: 5,
      margin: '6px 0',
      '& input': {
        border: 'solid 2px',
        borderColor: 'divider',
        backgroundColor: 'whiteAlpha.5',
      }
    },

    '&-category-list': {
      marginRight: '-2px',
    },

    '&-category-label': {
      top: '-2px',
      paddingTop: '3px',
      marginBottom: '2px',
      borderBottom: 'solid 1.5px',
      borderColor: 'divider',
      backgroundColor: 'bg',
      '& span': {
        backgroundColor: 'bg'
      }
    },

    '&-emoji': {
      '&:hover::before': {
        borderRadius: '4px'
      },
      '&:focus': {
        borderRadius: '50%',
        transform: 'scale(0.8)',
        '&:not(:focus-visible)': {
          transform: 'none'
        }
      },
      '& span': {
        display: 'inline-flex !important',
        justifyContent: 'center',
        alignItems: 'center'
      }
    },

    '&-skin-swatches': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '2.2rem',
      minHeight: '2.2rem',
      border: 'none',
      backgroundColor: 'bg',
      borderRadius: '2.2rem',
      '&.opened .emoji-mart-skin-swatch': {
        width: '2.2rem',
      },
      '.emoji-mart-skin-swatch.selected': {
        width: '2.2rem'
      }
    },

    '&-skin': {
      maxWidth: 'none',
      cursor: 'pointer'
    },

    '&-preview': {
      height: '3rem',
      '&-data': {
        left: '1rem',
      },
      '&-skins': {
        right: '1rem'
      }
    },

    '&-title-label': {
      fontSize: '1rem',
      color: 'whiteAlpha.70',
      fontWeight: 'normal'
    }
  },
}))

export default EmojiPicker