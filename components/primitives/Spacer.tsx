type SpaceProp = string | number | Array<string | number>

interface Props {
  mt?: SpaceProp
  mr?: SpaceProp
  mb?: SpaceProp
  ml?: SpaceProp
}

const Spacer = (props: Props) => (
  <div sx={{ ...props }} />
)

export default Spacer