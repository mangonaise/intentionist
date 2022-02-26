import { forwardRef, PropsWithChildren } from 'react'
import exclude from '@/logic/utils/exclude'
import Button, { ButtonProps } from './Button'
import Icon from './Icon'
import Text from './Text'

interface Props extends ButtonProps {
  icon: () => JSX.Element
  right?: boolean
}

const iconMargin = '0.8em'

const IconButton = forwardRef<HTMLButtonElement, PropsWithChildren<Props>>(function IconButton(props, ref: any) {
  const { icon, right, children } = props

  return (
    <Button
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: right ? 'row-reverse' : 'row',
        paddingX: children ? undefined : 0,
        minWidth: children ? undefined : '2.5rem'
      }}
      ref={ref}
      {...exclude(props, 'icon', 'right')}
    >
      <Icon
        icon={icon}
        sx={{
          ml: right && children ? iconMargin : 0,
          mr: !right && children ? iconMargin : 0,
          transform: 'translateY(-0.04rem) scale(1.35)'
        }}
      />
      <Text type="span" sx={{ height: '1rem', lineHeight: '1rem' }}>
        {children}
      </Text>
    </Button>
  )
})

export default IconButton