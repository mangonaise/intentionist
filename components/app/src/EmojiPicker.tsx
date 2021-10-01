import 'emoji-mart/css/emoji-mart.css'
import { useLayoutEffect, useRef, useState } from 'react';
import { BaseEmoji, Picker } from 'emoji-mart';
import styled from '@emotion/styled';
import css from '@styled-system/css';

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
        theme="dark"
        set="twitter"
        emojiSize={20}
        sheetSize={20}
        showPreview={false}
        title={label}
        emoji=""
        color="var(--text-color)"
        notFoundEmoji=""
        autoFocus
        exclude={['recent']}
      />
    </EmojiMartWrapper>
  )
}

let EmojiMartWrapper = styled.div(css({
  position: 'absolute',
  zIndex: 1,
  '.emoji-mart': {
    opacity: 0,
    animation: 'fade-in forwards 200ms',
    backgroundColor: 'bg',
    fontFamily: 'inherit',
    '@media screen and (max-width: 400px)': {
      width: '100vw !important',
      position: 'fixed',
      left: 0,
      right: 0
    },
  },
  '.emoji-mart-search': {
    zIndex: 5,
    margin: '6px 0'
  },
  '.emoji-mart-category-label': {
    top: '-2px',
    paddingTop: '3px',
    marginBottom: '2px',
    borderBottom: 'solid 1px #444',
    backgroundColor: 'bg',
    '& span': {
      backgroundColor: 'bg'
    }
  },
  '.emoji-mart-emoji:focus': {
    borderRadius: '50%',
    transform: 'scale(0.8)',
    '&:not(:focus-visible)': {
      transform: 'none'
    }
  },
  '.emoji-mart-skin-swatches': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '20px',
    minHeight: '20px',
    borderRadius: '10px'
  },
  '.emoji-mart-preview': {
    height: '2.5rem'
  },
  '.emoji-mart-preview-data': {
    left: '1rem',
  },
  '.emoji-mart-preview-skins': {
    right: '1rem'
  },
  '.emoji-mart-title-label': {
    fontSize: '1rem',
    color: 'whiteAlpha.70',
    fontWeight: 'normal'
  }
}))

export default EmojiPicker