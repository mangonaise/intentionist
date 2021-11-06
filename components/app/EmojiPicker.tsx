import 'emoji-mart/css/emoji-mart.css'
import 'react-responsive-modal/styles.css'
import isWindowsOS from '@/logic/utils/isWindowsOS'
import { FC, useEffect, useRef, useState } from 'react'
import { Global } from '@emotion/react'
import { css } from '@theme-ui/css'
import { BaseEmoji, Picker } from 'emoji-mart'
import Heading from '@/components/primitives/Heading'
import Flex from '@/components/primitives/Flex'
import Text from '@/components/primitives/Text'
import IconButton from '@/components/primitives/IconButton'
import Box from '@/components/primitives/Box'
import CrossIcon from '@/components/icons/CrossIcon'
import Modal from 'react-responsive-modal'

interface Props {
  isOpen: boolean,
  label: string,
  onClosePicker: () => void,
  onSelectEmoji: (emoji: BaseEmoji) => void,
}

const EmojiPicker = ({ isOpen, label, onSelectEmoji, onClosePicker }: Props) => {
  const modalRef = useRef(null!)

  function handleSelectEmoji(emoji: BaseEmoji) {
    onSelectEmoji(emoji)
    onClosePicker()
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClosePicker}
      classNames={{
        modalAnimationIn: 'in',
        modalAnimationOut: 'out'
      }}
      animationDuration={250}
      showCloseIcon={false}
      initialFocusRef={modalRef}
      ref={modalRef}
    >
      <StyleWrapper>
        <Flex column sx={{ margin: 'auto' }}>
          <Flex align="center">
            <Heading
              level={3}
              sx={{ textShadow: 'var(--text-shadow)', fontSize: ['1.5rem', '1.8rem'] }}
            >
              Choose an emoji
            </Heading>
            <IconButton
              onClick={onClosePicker}
              icon={CrossIcon}
              sx={{
                ml: 'auto',
                bg: 'transparent'
              }}
            />
          </Flex>
          <Text
            type="span"
            sx={{ textShadow: 'var(--text-shadow)', fontSize: '1.1rem', opacity: 0.8 }}
          >
            {label}
          </Text>
          <PickerWrapper onSelectEmoji={handleSelectEmoji} />
        </Flex>
      </StyleWrapper>
    </Modal>
  )
}

const PickerWrapper = ({ onSelectEmoji }: { onSelectEmoji: (emoji: BaseEmoji) => void }) => {
  const [autoFocusSearch] = useState(typeof window === undefined ? false : window.innerWidth > 768)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const delay = setTimeout(() => {
      setShow(true)
    }, 260)
    return () => clearTimeout(delay)
  }, [])

  useEffect(() => {
    if (show) {
      if (autoFocusSearch) {
        const search = document.querySelector<HTMLInputElement>('[id^="emoji-mart-search-"]')
        search?.setAttribute('autocomplete', 'off')
        search?.focus()
      }
    }
  }, [show])

  function handleSelect(emoji: BaseEmoji) {
    onSelectEmoji(emoji)
  }

  return (
    <Box id="emoji-picker" sx={{ width: ['auto', 'min(594px, 95vw)'], height: '400px' }}>
      {show && (
        <Picker
          onSelect={(emoji: BaseEmoji) => handleSelect(emoji)}
          native={!isWindowsOS}
          theme="dark"
          set="twitter"
          emojiSize={26}
          sheetSize={32}
          perLine={15}
          showPreview={false}
          title={'Skin tone'}
          emoji=""
          color="var(--text-color)"
          notFoundEmoji=""
          exclude={['recent']}
        />
      )}
    </Box>
  )
}

const StyleWrapper: FC = ({ children }) => {
  return (
    <>
      {children}
      <Global styles={css({
        ':root': {
          '--text-shadow': 'black 1px 1px 4px',
        },
        '::-webkit-scrollbar-track': {
          background: 'none',
        },
        '::-webkit-scrollbar-thumb': {
          borderRadius: '999px'
        },
        '.react-responsive-modal': {
          '&-overlay': {
            backgroundColor: 'rgba(0, 0, 0, 0.85)'
          },
          '&-modal': {
            maxWidth: '100vw',
            position: ['fixed', 'relative'],
            top: ['auto', '10%'],
            bottom: [0, null],
            left: [0, null],
            right: [0, null],
            margin: 0,
            backgroundColor: 'transparent',
            boxShadow: 'none',
            paddingX: 3,
            paddingY: 3,
            transform: 'scale(1)',
            '@keyframes in': {
              '0%': { opacity: 0, transform: 'translateY(50px)' },
              '100%': { opacity: 1 }
            },
            '@keyframes out': {
              '0%': { opacity: 1 },
              '100%': { opacity: 0, transform: 'translateY(15px)' }
            }
          }
        },

        '.emoji-mart': {
          opacity: 0,
          animation: 'fade-in forwards 750ms',
          backgroundColor: 'transparent',
          border: 'none',
          transform: 'translateY(4px)',
          fontFamily: 'inherit',
          maxWidth: '100%',

          '&-bar': {
            backgroundColor: 'transparent',
            border: 'none',
            '&:first-of-type': {
              borderBottomWidth: '2px'
            },
            '&:last-child': {
              borderTopWidth: '2px'
            }
          },

          '&-anchors': {
            padding: 0,
          },

          '&-anchor-bar': {
            borderRadius: '99px'
          },

          '&-search': {
            zIndex: 5,
            margin: '6px 0',
            padding: 0,
            '& input': {
              paddingX: 0,
              border: 'none',
              borderBottom: 'solid 2px',
              borderColor: 'rgba(255, 255, 255, 0.4) !important',
              borderRadius: 0,
              backgroundColor: 'transparent !important',
              textShadow: 'var(--text-shadow)',
              transition: 'border-color 150ms',
              '&::placeholder': {
                color: 'whiteAlpha.90',
                textShadow: 'var(--text-shadow)',
              },
              '&:focus': {
                boxShadow: 'none',
                borderColor: 'rgba(255, 255, 255, 0.8) !important'
              }
            },

            '&-icon': {
              right: '2px'
            }
          },

          '&-scroll': {
            paddingLeft: 0,
          },

          '&-category-list': {
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            '.emoji-mart-emoji': {
              padding: '4px',
              '&:hover::before': {
                borderRadius: '4px'
              },
              '&:focus': {
                borderRadius: 'default',
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
          },

          '&-category-label': {
            top: '-2px',
            paddingTop: '3px',
            marginBottom: '2px',
            width: 'fit-content',
            border: 'none',
            backgroundColor: 'transparent',
            '& span': {
              backgroundColor: 'rgba(0, 0, 0, 0) !important',
              textShadow: 'black 1px 1px 4px, black 1px 1px 4px',
              borderRadius: '3px',
              paddingLeft: 0,
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
            background: 'none !important',
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
              opacity: 0.8,
              left: 0
            },
            '&-skins': {
              right: 0
            }
          },

          '&-title-label': {
            fontSize: '1rem',
            color: 'whiteAlpha.70',
            fontWeight: 'normal'
          }
        },
      })} />
    </>
  )
}

export default EmojiPicker