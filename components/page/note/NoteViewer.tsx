import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { forwardRef, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { Global } from '@emotion/react'
import { css } from '@theme-ui/css'
import { NoteContext } from 'pages/note'
import DbHandler from '@/logic/app/DbHandler'
import useWarnUnsavedChanges from '@/hooks/useWarnUnsavedChanges'
import useWindowWidth from '@/hooks/useWindowWidth'
import MarkdownToJSX from 'markdown-to-jsx'
import ReactMde from 'react-mde'
import 'react-mde/lib/styles/css/react-mde-all.css'

const toolbarCommands = [['header', 'bold', 'italic', 'strikethrough', 'quote', 'code', 'link']]

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

  const handleKeyDown = useMemo(() => {
    return (key: string) => {
      if (key === 'Escape') {
        const writeButton = document.querySelector('.mde-tabs')?.firstChild
        if (writeButton instanceof HTMLElement) writeButton.focus()
      }
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
    <div className="container" onKeyDown={(e) => handleKeyDown(e.key)}>
      <ReactMde
        toolbarCommands={toolbarCommands}
        value={content}
        onChange={() => { }}
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
        textAreaComponent={Textarea}
      />
    </div>
  )
})

const Textarea = forwardRef<HTMLTextAreaElement>((_, ref: any) => {
  const { editor, noteData: { content } } = useContext(NoteContext)
  const [shouldResize, setShouldResize] = useState(false)
  const isEditing = useMemo(() => editor.isEditing, [editor.isEditing])

  const handleChange = useCallback((value: string) => {
    editor.updateNote('content', value)
    setShouldResize(true)
  }, [])

  function handleKeyDown(e: KeyboardEvent) {
    const target = e.target as HTMLTextAreaElement
    const start = target.selectionStart

    function insertText(text: string) {
      e.preventDefault()
      const newValue = content.slice(0, start) + text + content.slice(start)
      editor.updateNote('content', newValue)
      target.value = newValue
      target.selectionEnd = start + text.length
      setShouldResize(true)
    }

    if (e.key === 'Tab') {
      if (!e.shiftKey) {
        insertText('\t')
      }
    } else if (e.key === 'Enter') {
      if (!content[start - 1]?.match(/\s/)) {
        insertText('  \n')
      }
    } else if (e.key === 'Backspace') {
      const tripleBackspace = (content[start - 3] === ' ' && content[start - 2] === ' ' && content[start - 1] === '\n')
      if (tripleBackspace) {
        e.preventDefault()
        const newValue = content.slice(0, start - 3) + content.slice(start)
        editor.updateNote('content', newValue)
        target.value = newValue
        target.selectionEnd = start - 3
      }
    }
  }

  useEffect(() => {
    if (isEditing) {
      setShouldResize(true)
    }
  }, [isEditing])

  useLayoutEffect(() => {
    if (shouldResize) {
      ref.current.style.height = 'auto'
      ref.current.style.height = `${ref.current.scrollHeight}px`
      setShouldResize(false)
    }
  }, [shouldResize])

  return (
    <textarea
      className="mde-text"
      value={content}
      onChange={(e) => handleChange(e.target.value)}
      onKeyDown={(e) => handleKeyDown(e as any)}
      placeholder="Start writing your note here."
      ref={ref}
    />
  )
})

const DynamicToolbarStyles = () => {
  const { editor } = useContext(NoteContext)
  const windowWidth = useWindowWidth()
  const scrollable = windowWidth <= 360

  return (
    <Global styles={css({
      '.react-mde .mde-header': {
        display: editor.isEditing ? undefined : 'none',
        overflowX: scrollable ? 'scroll' : 'hidden',
        justifyContent: scrollable ? 'flex-start' : ['center', 'flex-start']
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
          position: ['fixed', 'static'],
          isolation: 'isolate',
          paddingX: [1, 0],
          zIndex: 2,
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          flexWrap: 'nowrap',
          maxWidth: '100%',
          alignItems: 'center',
          marginBottom: [0, 2],
          borderRadius: 'default',
          backgroundColor: ['bg', 'transparent'],
          color: 'text',
          border: 'none',
          '&-item button svg': {
            color: 'whiteAlpha.60',
            '&:hover': {
              color: 'text'
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
          backgroundColor: 'button',
          border: 'none !important',
          '&:hover': {
            backgroundColor: 'buttonHighlight'
          },
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
            marginRight: '0.25rem !important'
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
          }
        }
      }
    })}
    />
  )
}

export default NoteViewer