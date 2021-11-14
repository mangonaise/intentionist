import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Global } from '@emotion/react'
import { css } from '@theme-ui/css'
import { NoteContext } from 'pages/note'
import DbHandler from '@/logic/app/DbHandler'
import useWarnUnsavedChanges from '@/hooks/useWarnUnsavedChanges'
import useWindowWidth from '@/hooks/useWindowWidth'
import MarkdownToJSX from 'markdown-to-jsx'
import ReactMde from 'react-mde'
import 'react-mde/lib/styles/css/react-mde-all.css'

const maxNoteLength = 48000

const toolbarCommands = [['header', 'bold', 'italic', 'strikethrough', 'code', 'quote', 'unordered-list', 'link']]

const NoteViewer = () => {
  return (
    <>
      <Markdown />
      <StaticStyles />
      <DynamicToolbarStyles />
    </>
  )
}

const Markdown = observer(() => {
  const { isWriteComplete } = container.resolve(DbHandler)
  const { editor, noteData: { content } } = useContext(NoteContext)
  const [selectedTab, setSelectedTab] = useState<'write' | 'preview'>('preview')
  const isEditing = useMemo(() => editor.isEditing, [editor.isEditing])
  const resize = useSmartTextarea()

  useLayoutEffect(() => {
    const isPreviewing = selectedTab === 'preview'
    if (isEditing && isPreviewing) {
      setSelectedTab('write')
    } else if (!isEditing && !isPreviewing) {
      setSelectedTab('preview')
    }
  }, [isEditing])

  useEffect(() => {
    const headerButtonItems = document.querySelectorAll('.mde-header-item')
    headerButtonItems.forEach((item) => {
      if (item instanceof HTMLElement) {
        item.tabIndex = 0
      }
    })
  }, [])

  const handleChange = useCallback((value: string) => {
    if (value.length <= maxNoteLength) {
      editor.updateNote('content', value)
      resize()
    }
  }, [])

  useWarnUnsavedChanges(
    {
      routeChange: editor.hasUnsavedChanges,
      unload: editor.hasUnsavedChanges || !isWriteComplete
    },
    'Changes you made may not be saved. Are you sure you want to leave?'
  )

  return (
    <ReactMde
      toolbarCommands={toolbarCommands}
      value={content}
      onChange={handleChange}
      selectedTab={selectedTab}
      onTabChange={setSelectedTab}
      generateMarkdownPreview={markdown =>
        Promise.resolve(<MarkdownToJSX
          options={{
            disableParsingRawHTML: true,
          }}
        >
          {markdown}
        </MarkdownToJSX>)}
    />
  )
})

function useSmartTextarea() {
  const { editor } = useContext(NoteContext)
  const textareaRef = useRef<HTMLTextAreaElement>(null!)
  const isEditing = useMemo(() => editor.isEditing, [editor.isEditing])

  const resize = useCallback(() => {
    const scrollTop = document.documentElement.scrollTop
    textareaRef.current.style.height = 'auto'
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 28}px`
    window.scrollTo({ top: scrollTop })
  }, [textareaRef])

  useEffect(() => {
    const textarea = document.querySelector('.mde-text') as HTMLTextAreaElement
    textareaRef.current = textarea
    textarea.placeholder = 'Start writing your note here.'
    textarea.onkeydown = (e) => {
      const target = e.target as HTMLTextAreaElement
      const previousValue = target.value
      const start = target.selectionStart

      const insertText = (text: string) => {
        e.preventDefault()
        const newValue = previousValue.slice(0, start) + text + previousValue.slice(start)
        if (newValue.length <= maxNoteLength) {
          target.value = newValue
          target.selectionEnd = start + text.length
          editor.updateNote('content', newValue)
        }
      }

      if (e.key === 'Tab') {
        if (!e.shiftKey) {
          insertText('\t')
        }
      } else if (e.key === 'Enter') {
        if (!previousValue[start - 1]?.match(/\s/)) {
          insertText('  \n')
        }
      } else if (e.key === 'Backspace') {
        const tripleBackspace = (previousValue[start - 3] === ' ' && previousValue[start - 2] === ' ' && previousValue[start - 1] === '\n')
        if (tripleBackspace) {
          e.preventDefault()
          const newValue = previousValue.slice(0, start - 3) + previousValue.slice(start)
          target.value = newValue
          target.selectionEnd = start - 3
          editor.updateNote('content', newValue)
        }
      }
    }
  }, [])

  useLayoutEffect(() => {
    if (isEditing && textareaRef) {
      resize()
    }
  }, [isEditing, textareaRef])

  return resize
}

const DynamicToolbarStyles = () => {
  const { editor } = useContext(NoteContext)
  const windowWidth = useWindowWidth()
  const scrollable = windowWidth <= 435

  return (
    <Global styles={css({
      '.react-mde .mde-header': {
        display: editor.isEditing ? undefined : 'none',
        overflowX: scrollable ? 'scroll' : 'hidden'
      }
    })} />
  )
}

const StaticStyles = () => {
  return (
    <Global styles={css({
      '.react-mde': {
        border: 'none',
        '.mde-header': {
          position: 'sticky',
          top: '3.25rem',
          zIndex: 2,
          marginBottom: [1, 2],
          display: 'flex',
          flexWrap: 'nowrap',
          maxWidth: '100%',
          alignItems: 'center',
          borderRadius: 'default',
          background: 'none',
          color: 'text',
          border: 'none',
          '&-group': {
            padding: '0 !important',
            marginY: '4px !important',
            backgroundColor: '#242424',
            borderRadius: 'default'
          },
          '&-item': {
            margin: '0 !important',
            '& button': {
              height: '2.5rem !important',
              paddingX: '0.75rem !important',
              background: 'none',
              '&:hover svg': {
                color: 'text'
              },
              'svg': {
                color: 'whiteAlpha.60',
              }
            }
          }
        },
        '.mde-tabs button': {
          margin: '0 !important',
          paddingX: '1rem',
          height: '2.5rem',
          fontFamily: 'inherit',
          color: 'inherit',
          fontWeight: 'medium',
          borderRadius: 'default',
          backgroundColor: '#242424',
          border: 'none !important',
          '&.selected': {
            backgroundColor: 'notes',
          },
          '&:first-of-type': {
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0
          },
          '&:nth-of-type(2)': {
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            marginRight: '0.5rem !important'
          },
          '&:focus': {
            zIndex: 1
          }
        },
        '.mde-header-group': {
          display: 'flex',
          alignItems: 'center',
          paddingX: '0 !important'
        },
        '.mde-text': {
          maxWidth: '100%',
          minHeight: '40vh',
          padding: '0.25rem !important',
          fontFamily: 'Inter Extended',
          fontWeight: 'light',
          fontSize: '1rem',
          background: 'none',
          color: 'text',
          resize: 'none !important' as any,
          '&:focus': {
            boxShadow: 'none'
          }
        },
        '.mde-preview-content': {
          padding: 1,
          fontWeight: 'light',
          fontFamily: 'Inter Extended',
          'em': {
            fontStyle: 'normal',
            fontVariationSettings: '"slnt" -10'
          },
          'code': {
            color: '#77d988',
            backgroundColor: 'whiteAlpha.8',
            fontSize: '1rem !important',
          },
          'pre': {
            borderRadius: 'default',
            backgroundColor: 'whiteAlpha.8',
          },
          'blockquote': {
            paddingBlock: 4,
            paddingLeft: 4,
            marginInline: '0',
            marginInlineEnd: 2,
            marginBlockStart: 2,
            color: 'text',
            borderLeft: 'solid 4px',
            borderColor: 'whiteAlpha.20',
            backgroundColor: 'whiteAlpha.5',
            '& > blockquote': {
              marginRight: 4
            }
          },
          'input': {
            transform: 'translateY(2px)',
            pointerEvents: 'none',
          },
          'hr': {
            border: 'none',
            borderBottom: 'solid 1px',
            borderColor: 'divider',
            marginBlockEnd: '1em'
          },
          'h1, h2, h3': {
            borderBottomColor: 'divider',
            marginBlock: 4
          },
          'a': {
            color: '#5493ff',
            fontWeight: 'normal'
          }
        }
      }
    })}
    />
  )
}

export default NoteViewer