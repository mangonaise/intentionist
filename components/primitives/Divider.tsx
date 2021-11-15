import Box from '@/components/primitives/Box'

const Divider = ({ color }: { color?: string }) => {
  return (
    <Box sx={{ borderTop: 'solid 1px', borderColor: color ?? 'divider' }} />
  )
}

export default Divider