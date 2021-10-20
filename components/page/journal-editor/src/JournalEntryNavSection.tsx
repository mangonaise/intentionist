import { useContext } from 'react'
import { BackIcon, CheckIcon, PencilIcon } from '@/components/icons'
import { Flex, IconButton } from '@/components/primitives'
import { JournalContext } from 'pages/journal/[id]'
import { observer } from 'mobx-react-lite'
import { Dropdown } from '@/components/app'
import NextLink from 'next/link'

const JournalEntryNavSection = () => {
  const { editor: { isEditing } } = useContext(JournalContext)

  if (isEditing) {
    return <EditorNavSection />

  } else {
    return <DefaultNavSection />
  }

}

const EditorNavSection = () => {
  const { editor } = useContext(JournalContext)

  return (
    <Flex>
      <IconButton
        icon={CheckIcon}
        onClick={editor.finishEditing}
        sx={{ bg: 'journal', mr: 2 }}
        hoverEffect="opacity"
      >
        Done
      </IconButton>
      <Dropdown title="" right={0} sx={{ ml: 'auto' }}>
        <Dropdown.Item itemAction={editor.deleteEntry}>Delete entry</Dropdown.Item>
      </Dropdown>
    </Flex>
  )
}

const DefaultNavSection = () => {
  const { editor } = useContext(JournalContext)

  return (
    <Flex>
      <NextLink href="/home">
        <IconButton icon={BackIcon} />
      </NextLink>
      <IconButton
        icon={PencilIcon}
        onClick={editor.startEditing}
        sx={{ bg: 'journal', ml: 2 }}
        hoverEffect="opacity"
      />
    </Flex>
  )
}

export default observer(JournalEntryNavSection)