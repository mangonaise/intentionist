import type { StyledComponent } from '../types/StyledComponent'
import { createContext, ReactNode, useContext, useState } from 'react'
import Button, { ButtonProps } from '@/components/primitives/Button'
import Box from '@/components/primitives/Box'
import Flex from '@/components/primitives/Flex'
import Icon from '@/components/primitives/Icon'
import ExpandUpIcon from '@/components/icons/ExpandUpIcon'
import ExpandDownIcon from '@/components/icons/ExpandDownIcon'
import FocusTrap from 'focus-trap-react'

interface DropdownProps {
  title?: string | JSX.Element,
  anchorRight?: boolean,
  noGap?: boolean,
  disabled?: boolean,
  className?: string,
  children: ReactNode
}

type DropdownContextValue = DropdownProps & {
  isOpen: boolean,
  openDropdown: () => void,
  closeDropdown: () => void,
}

const DropdownContext = createContext<DropdownContextValue>(null!)

const Dropdown = (props: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)

  function openDropdown() {
    setIsOpen(true)
    document.body.style.overflow = 'hidden'
  }

  function closeDropdown() {
    setIsOpen(false)
    document.body.style.overflow = 'unset'
  }

  const contextValue: DropdownContextValue = {
    isOpen,
    openDropdown,
    closeDropdown,
    ...props
  }

  return (
    <DropdownContext.Provider value={contextValue}>
      <Box sx={{ position: 'relative' }} className={props.className}>
        <DropdownButton />
        {isOpen && <DropdownMenu />}
      </Box>
    </DropdownContext.Provider>
  )
}

const DropdownButton = () => {
  const [preventOpen, setPreventOpen] = useState(false)
  const { isOpen, openDropdown, title, disabled } = useContext(DropdownContext)

  function handleClick() {
    if (!preventOpen) {
      openDropdown()
    }
    setPreventOpen(false)
  }

  function handlePointerDown() {
    setPreventOpen(isOpen)
  }

  return (
    <Button
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      disabled={disabled}
      sx={{
        paddingX: title ? undefined : 3,
        size: '100%',
        '&:disabled': { opacity: 0.75 }
      }}
    >
      <Flex align="center">
        {title}
        <Icon
          icon={isOpen ? ExpandUpIcon : ExpandDownIcon}
          sx={{ ml: 'auto', pl: title ? '0.8em' : 0, transform: 'scale(1.1)' }}
        />
      </Flex>
    </Button>
  )
}

const DropdownMenu = () => {
  const { closeDropdown, children, noGap, anchorRight } = useContext(DropdownContext)

  return (
    <FocusTrap focusTrapOptions={{
      onDeactivate: closeDropdown,
      clickOutsideDeactivates: true
    }}>
      <Flex column
        sx={{
          position: 'absolute',
          right: anchorRight ? 0 : 'auto',
          zIndex: 1,
          backgroundColor: 'bg',
          width: 'max-content',
          minWidth: '100%',
          transform: noGap ? null : 'translateY(4px)',
          border: 'solid 2px',
          borderColor: 'divider',
          borderRadius: 'default',
          opacity: 0,
          animation: 'fade-in forwards 200ms'
        }}>
        {children}
      </Flex>
    </FocusTrap>
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