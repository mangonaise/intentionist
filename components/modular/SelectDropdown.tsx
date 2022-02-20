import type { StyledComponent } from '@/components/types/StyledComponent'
import Dropdown from '@/components/modular/Dropdown'
import Text from '@/components/primitives/Text'
import Icon from '@/components/primitives/Icon'
import Flex from '@/components/primitives/Flex'
import CheckIcon from '@/components/icons/CheckIcon'

interface Props {
  title: string,
  highlight?: boolean,
  highlightColor?: string,
  anchorRight?: boolean | boolean[]
}

const SelectDropdown: StyledComponent<Props> = ({ title, highlight, highlightColor, anchorRight, className, children }) => {
  return (
    <Dropdown
      title={title}
      noArrow
      anchorRight={anchorRight}
      highlightWhenOpen={false}
      className={className}
      sx={{
        '& > button': {
          minHeight: ['1.6rem', '1.6rem', '1.75rem'],
          px: '0.85rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: highlight ? (highlightColor ?? 'buttonAccent') : 'whiteAlpha.5',
          borderRadius: '99px',
          color: highlight ? 'text' : 'whiteAlpha.80',
          fontWeight: highlight ? 'medium' : 'normal',
          '&:hover': {
            backgroundColor: highlight ? (highlightColor ?? 'buttonAccent') : undefined,
            opacity: highlight ? 0.85 : 1
          }
        }
      }}
    >
      {children}
    </Dropdown>
  )
}

interface SelectDropdownItemProps {
  title: string,
  description: string,
  selected: boolean,
  onClick: () => void
}

const Item = ({ title, description, selected, onClick }: SelectDropdownItemProps) => {
  return (
    <Dropdown.Item
      sx={{ py: 3 }}
      itemAction={onClick}
    >
      <Flex column sx={{ maxWidth: 'calc(100vw - 3rem)' }}>
        <Text type="span">
          {title}{selected && <CheckMark />}
        </Text>
        <Text
          sx={{
            mt: 2, maxWidth: '18.2rem', minWidth: '100%',
            color: 'whiteAlpha.70', fontWeight: 'light', lineHeight: 1.15
          }}
        >
          {description}
        </Text>
      </Flex>
    </Dropdown.Item>
  )
}

const CheckMark = () => {
  return (
    <Icon icon={CheckIcon} sx={{ ml: 2 }} />
  )
}

export default Object.assign(SelectDropdown, { Item })