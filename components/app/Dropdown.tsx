import type { StyledComponent } from '../types/StyledComponent'
import { createContext, ReactNode, useContext, useState } from 'react'
import Button, { ButtonProps } from '@/components/primitives/Button'
import Box from '@/components/primitives/Box'
import Flex from '@/components/primitives/Flex'
import Icon from '@/components/primitives/Icon'
import ExpandUpIcon from '@/components/icons/ExpandUpIcon'
import ExpandDownIcon from '@/components/icons/ExpandDownIcon'
import NextLink from 'next/link'
import FocusTrap from 'focus-trap-react'

interface DropdownProps {
  title?: string | JSX.Element,
  anchorRight?: boolean | boolean[],
  noGap?: boolean,
  noArrow?: boolean,
  disabled?: boolean,
  menuMaxWidth?: string | string[],
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
  }

  function closeDropdown() {
    setIsOpen(false)
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
  const { isOpen, openDropdown, title, noArrow, disabled } = useContext(DropdownContext)

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
      <Flex align="center" sx={{ textAlign: 'left', wordBreak: 'break-word' }}>
        {title}
        {!noArrow && (
          <Icon
            icon={isOpen ? ExpandUpIcon : ExpandDownIcon}
            sx={{ ml: 'auto', pl: title ? '0.6em' : 0, transform: 'scale(1.1)' }}
          />
        )}
      </Flex>
    </Button>
  )
}

const DropdownMenu = () => {
  const { closeDropdown, children, noGap, anchorRight, menuMaxWidth } = useContext(DropdownContext)

  let positionRight: Array<0 | 'auto'>
  if (!anchorRight) {
    positionRight = ['auto']
  }
  else if (anchorRight === true) {
    positionRight = [0]
  }
  else {
    positionRight = anchorRight.map((anchor) => anchor ? 0 : 'auto')
  }

  return (
    <FocusTrap focusTrapOptions={{
      onDeactivate: closeDropdown,
      clickOutsideDeactivates: true,
      initialFocus: false
    }}>
      <div>
        <Flex column
          sx={{
            position: 'absolute',
            right: positionRight,
            zIndex: 1,
            width: 'max-content',
            maxWidth: menuMaxWidth,
            minWidth: '100%',
            transform: noGap ? null : 'translateY(5px)',
            backgroundColor: '#2d2d2d',
            borderRadius: 'default',
            boxShadow: 'var(--background-color) 0px 4px 16px 0px',
            wordBreak: 'break-word',
            opacity: 0,
            animation: 'fade-in forwards 200ms',
            '&::after': {
              position: 'absolute',
              content: '""',
              bottom: '-0.5rem',
              height: '0.5rem',
              width: '1px'
            }
          }}>
          {children}
        </Flex>
      </div>
    </FocusTrap>
  )
}

interface ItemProps extends ButtonProps {
  itemAction?: () => void,
  href?: string
}

const Item: StyledComponent<ItemProps> = (props) => {
  const { itemAction, href, children } = props
  const { closeDropdown } = useContext(DropdownContext)

  function handleClick() {
    itemAction?.()
    closeDropdown()
  }

  const component = (
    <Button
      onClick={handleClick}
      sx={{
        minHeight: '2.6rem',
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

  return href
    ? <NextLink href={href}>{component}</NextLink>
    : component
}

export default Object.assign(Dropdown, { Item })