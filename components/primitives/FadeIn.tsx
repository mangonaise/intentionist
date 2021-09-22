import Box, { BoxProps } from './Box';

interface Props extends BoxProps {
  time?: number,
  delay?: number
}

const FadeIn = ({ time = 300, delay = 25, children, ...props }: Props) => {
  return (
    <Box
      {...props}
      style={{ opacity: 0, animation: `fade-in forwards ${time}ms ${delay}ms` }}
    >
      {children}
    </Box>
  )
}
export default FadeIn