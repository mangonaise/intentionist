import { createContext, ReactNode, useContext, useState } from 'react'
import { Button, FadeIn, Flex, Icon } from '@/components/primitives'
import { BoxProps } from '@/components/primitives/src/Box'
import { BlurListener } from '@/components/app'
import { ExpandDownIcon, ExpandUpIcon } from '@/components/icons'
import styled from '@emotion/styled'
import css from '@styled-system/css'

interface DropdownProps extends BoxProps {
  title: string,
  children: ReactNode,
  right?: number | 'auto' | Array<number | 'auto'>
}

const DropdownContext = createContext<DropdownContextValue>(null!)
type DropdownContextValue = { closeDropdown: () => void }

const Dropdown = ({ title, children, right = 'auto', ...props }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)

  function closeDropdown() {
    setIsOpen(false)
  }

  return (
    <DropdownContext.Provider value={{ closeDropdown }}>
      <BlurListener
        blurAction={closeDropdown}
        position="relative"
        zIndex={1}
        height="inherit"
        {...props}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          width="100%"
          height="100%"
          textAlign="left"
          display="flex"
          px={title ? undefined : 3}
        >
          {title}
          <ExpandIcon icon={isOpen ? ExpandUpIcon : ExpandDownIcon} pl={title ? '0.8em' : 0} />
        </Button>
        {isOpen && (
          <FadeIn time={200}>
            <DropdownContentWrapper right={right}>
              {children}
            </DropdownContentWrapper>
          </FadeIn>
        )}
      </BlurListener>
    </DropdownContext.Provider>
  )
}

interface ItemProps {
  text: string,
  action: () => void,
}

const Item = ({ text, action }: ItemProps) => {
  const { closeDropdown } = useContext(DropdownContext)

  function handleClick() {
    action()
    closeDropdown()
  }

  return (
    <ItemButton onClick={handleClick}>
      {text}
    </ItemButton>
  )
}

let DropdownContentWrapper = styled(Flex)(css({
  position: 'absolute',
  flexDirection: 'column',
  backgroundColor: 'bg',
  width: 'max-content',
  transform: 'translateY(4px)',
  border: 'solid 2px',
  borderColor: 'divider',
  borderRadius: 'default'
}))

let ExpandIcon = styled(Icon)({
  marginLeft: 'auto',
  transform: 'scale(1.35) translateY(0.08em)'
})

let ItemButton = styled(Button)(css({
  textAlign: 'left',
  margin: '-2px',
  py: '0.8em',
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
    backgroundColor: 'transparent'
  }
}))

export default Object.assign(Dropdown, { Item })