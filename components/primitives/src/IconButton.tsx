import { forwardRef } from 'react'
import Button, { ButtonProps } from './Button'
import CenteredFlex from './CenteredFlex'
import Icon from './Icon'

interface Props extends ButtonProps {
  icon: () => JSX.Element
  right?: boolean
}

const iconMargin = '0.8em'

const IconButton = forwardRef(function IconButton({ icon, right, children, ...props }: Props, ref) {
  return (
    <Button {...props}>
      <CenteredFlex flexDirection={right ? 'row-reverse' : 'row'}>
        <Icon
          icon={icon}
          ml={right && children ? iconMargin : 0}
          mr={!right && children ? iconMargin : 0}
          style={{ transform: 'translateY(-0.04rem) scale(1.35)' }}
        />
        {children}
      </CenteredFlex>
    </Button>
  )
})

export default IconButton