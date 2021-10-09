import { forwardRef, PropsWithChildren } from 'react'
import Button, { ButtonProps } from './Button'
import Icon from './Icon'
import omit from 'lodash/omit'

interface Props extends ButtonProps {
  icon: () => JSX.Element
  right?: boolean,
}

const iconMargin = '0.8em'

const IconButton = forwardRef<HTMLButtonElement, PropsWithChildren<Props>>((props, ref: any) => {
  const { icon, right, children } = props

  return (
    <Button
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
      ref={ref}
      {...omit(props, 'icon', 'right')}
    >
      <Icon
        icon={icon}
        sx={{
          ml: right && children ? iconMargin : 0,
          mr: !right && children ? iconMargin : 0,
          transform: 'translateY(-0.04rem) scale(1.35)'
        }}
      />
      {children}
    </Button>
  )
})

IconButton.displayName = 'IconButton'

export default IconButton