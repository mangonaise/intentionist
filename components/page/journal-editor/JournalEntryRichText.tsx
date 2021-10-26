import { observer } from 'mobx-react-lite'
import { useContext, useState } from 'react'
import { Global } from '@emotion/react'
import { css } from '@theme-ui/css'
import { JournalContext } from 'pages/journal/[id]'
import Box from '@/components/primitives/Box'
import Text from '@/components/primitives/Text'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.bubble.css'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

const formats = ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block', 'list', 'indent', 'header']
const toolbarColor = 'rgba(15, 15, 15, 0.95)'
const maxEntryLength = 49900

const JournalEntryRichText = () => {
  return (
    <>
      <GlobalStyles />
      <EntryContent />
    </>
  )
}

const EntryContent = observer(() => {
  const { editor, entryData: { content } } = useContext(JournalContext)
  const [showLengthWarning, setShowLengthWarning] = useState(false)
  const [isBrowser] = useState(typeof window !== 'undefined')

  function handleChange(value: string) {
    if (editor.isEditing) {
      if (value.length > maxEntryLength) {
        setShowLengthWarning(true)
      } else {
        editor.updateEntry('content', value)
        setShowLengthWarning(false)
      }
    }
  }

  if (!isBrowser) return null

  return (
    <Box sx={{ position: 'relative' }}>
      <ReactQuill
        readOnly={!editor.isEditing}
        theme="bubble"
        preserveWhitespace
        formats={formats}
        modules={{
          toolbar: ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block', { 'header': [1, 2, 3, false] }],
          clipboard: {
            matchVisual: false
          }
        }}
        value={content}
        onChange={handleChange}
      />
      {editor.isEditing && (content === '' || content === '<p><br></p>') && (
        <Text
          type="span"
          sx={{
            position: 'absolute',
            top: '1px',
            opacity: 0.5,
            pointerEvents: 'none',
            fontWeight: 'light'
          }}
        >
          Start writing here. Highlight text to format.
        </Text>
      )}
      {showLengthWarning && (
        <Text type="span" sx={{ color: 'focus', fontWeight: 'semibold', mt: 2 }}>
          Your entry is too long. It will not be saved in full unless you shorten it.
        </Text>
      )}
    </Box>
  )
})

const GlobalStyles = () => {
  return (
    <>
      <Global styles={css({
        '@font-face': {
          fontFamily: 'Inter',
          fontStyle: 'italic',
          fontWeight: '1 999',
          'src': `url('/fonts/Inter-italic-var.woff2') format('woff2')`,
          'fontDisplay': 'swap'
        },
        '.ql': {
          '&-editor': {
            cursor: 'inherit',
            fontFamily: 'Inter',
            fontSize: '14px',
            fontWeight: 'light',
            minHeight: '50vh',
            padding: 0,
            '&:focus': {
              boxShadow: 'none',
            },
            '& blockquote': {
              borderLeftColor: '#555 !important'
            },
            '& strong, h1, h2, h3': {
              fontWeight: '600'
            }
          },
          '&-disabled *': {
            cursor: 'default'
          },
          '&-bubble .ql-tooltip': {
            opacity: 0,
            animation: 'fade-in forwards 250ms',
            backgroundColor: toolbarColor,
            '&-arrow': {
              borderBottomColor: `${toolbarColor} !important`,
              backgroundColor: 'transparent'
            }
          },
          '&-toolbar .ql-formats': {
            '& button:not(.ql-active)': {
              opacity: 0.55
            }
          },
          '&-picker': {
            '&-options': {
              right: 0,
              fontFamily: 'Inter',
              borderRadius: 'default',
              backgroundColor: `${toolbarColor} !important`,
              '.ql-picker-item::before': {
                content: '"Heading"'
              }
            },
            '&-label': {
              display: 'inline-flex !important',
              alignItems: 'center',
              fontFamily: 'Inter'
            }
          },
        }
      })}
      />
      <span sx={{ fontFamily: 'Inter', fontStyle: 'italic', pointerEvents: 'none' }} role="none presentation" />
    </>
  )
}

export default JournalEntryRichText