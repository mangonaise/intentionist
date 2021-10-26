import { useState } from 'react'
import ReactQuill from 'react-quill'

const JournalEntryRichTextEditor = () => {
  const [value, setValue] = useState('')

  return (
    <ReactQuill value={value} onChange={setValue} />
  )
}

export default JournalEntryRichTextEditor