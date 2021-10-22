import type { StyledComponent } from '@/components/types/StyledComponent'
import { createContext, useContext, useState } from 'react'
import Button, { ButtonProps } from '@/components/primitives/Button'
import FadeIn from '@/components/primitives/FadeIn'
import Flex from '@/components/primitives/Flex'
import Icon from '@/components/primitives/Icon'
import ExpandDownIcon from '@/components/icons/ExpandDownIcon'
import ExpandUpIcon from '@/components/icons/ExpandUpIcon'
import BlurListener from './BlurListener'

interface DropdownProps {
  title: string | JSX.Element,
  right?: number | 'auto' | Array<number | 'auto'>,
  noGap?: boolean,
  disabled?: boolean
}

const DropdownContext = createContext<DropdownContextValue>(null!)
type DropdownContextValue = { closeDropdown: () => void }

const Dropdown: StyledComponent<DropdownProps> = (props) => {
  const { title, right, noGap, disabled, children } = props
  const [isOpen, setIsOpen] = useState(false)

  function closeDropdown() {
    setIsOpen(false)
  }

  return (
    <DropdownContext.Provider value={{ closeDropdown }}>
      <BlurListener
        blurAction={closeDropdown}
        escapeAction={closeDropdown}
        className={props.className}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            textAlign: 'left',
            alignItems: 'center',
            paddingX: title ? undefined : 3,
            '&:disabled': { opacity: 0.75 }
          }}
        >
          {title}
          <Icon
            icon={isOpen ? ExpandUpIcon : ExpandDownIcon}
            sx={{
              marginLeft: 'auto',
              pl: title ? '0.8em' : 0,
              transform: 'scale(1.1)'
            }}
          />
        </Button>
        {isOpen && (
          <FadeIn time={200} sx={{ zIndex: 1, position: 'relative' }}>
            <Flex sx={{
              position: 'absolute',
              flexDirection: 'column',
              backgroundColor: 'bg',
              width: 'max-content',
              minWidth: '100%',
              transform: noGap ? null : 'translateY(4px)',
              border: 'solid 2px',
              borderColor: 'divider',
              borderRadius: 'default',
              right: right
            }}
            >
              {children}
            </Flex>
          </FadeIn>
        )}
      </BlurListener>
    </DropdownContext.Provider>
  )
}

interface ItemProps extends ButtonProps {
  itemAction: () => void
}

const Item: StyledComponent<ItemProps> = (props) => {
  const { itemAction, children } = props
  const { closeDropdown } = useContext(DropdownContext)

  function handleClick() {
    itemAction()
    closeDropdown()
  }

  return (
    <Button
      onClick={handleClick}
      sx={{
        margin: '-2px',
        py: '0.8em',
        textAlign: 'left',
        borderRadius: '0',
        '&:first-of-type': {
          borderTopLeftRadius: 'default',
          borderTopRightRadius: 'default'
        },
        '&:last-child': {
          borderBottomLeftRadius: 'default',
          borderBottomRightRadius: 'default'
        },
        '&:not(:hover)': {
          backgroundColor: props.hoverEffect ? undefined : 'transparent'
        }
      }}
      className={props.className}
      hoverEffect={props.hoverEffect}
    >
      {children}
    </Button>
  )
}

export default Object.assign(Dropdown, { Item })