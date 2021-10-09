import { createContext, useContext, useState } from 'react'
import { Button, FadeIn, Flex, Icon } from '@/components/primitives'
import { BlurListener } from '@/components/app'
import { ExpandDownIcon, ExpandUpIcon } from '@/components/icons'
import { StyledComponent } from '@/components/types/StyledComponent'

interface DropdownProps {
  title: string,
  right?: number | 'auto' | Array<number | 'auto'>
}

const DropdownContext = createContext<DropdownContextValue>(null!)
type DropdownContextValue = { closeDropdown: () => void }

const Dropdown: StyledComponent<DropdownProps> = (props) => {
  const { title, right, children } = props
  const [isOpen, setIsOpen] = useState(false)

  function closeDropdown() {
    setIsOpen(false)
  }

  return (
    <DropdownContext.Provider value={{ closeDropdown }}>
      <BlurListener
        blurAction={closeDropdown}
        sx={{ position: 'relative', zIndex: 1, height: 'inherit' }}
        className={props.className}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          sx={{ width: '100%', height: '100%', display: 'flex', textAlign: 'left', px: title ? undefined : 3 }}
        >
          {title}
          <Icon
            icon={isOpen ? ExpandUpIcon : ExpandDownIcon}
            sx={{
              pl: title ? '0.8em' : 0,
              transform: 'translateY(0.08em)'
            }}
          />
        </Button>
        {isOpen && (
          <FadeIn time={200}>
            <Flex sx={{
              position: 'absolute',
              flexDirection: 'column',
              backgroundColor: 'bg',
              width: 'max-content',
              transform: 'translateY(4px)',
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

interface ItemProps {
  action: () => void
}

const Item: StyledComponent<ItemProps> = (props) => {
  const { action, children } = props
  const { closeDropdown } = useContext(DropdownContext)

  function handleClick() {
    action()
    closeDropdown()
  }

  return (
    <Button
      onClick={handleClick}
      sx={{
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
      }}
      className={props.className}
    >
      {children}
    </Button>
  )
}

export default Object.assign(Dropdown, { Item })