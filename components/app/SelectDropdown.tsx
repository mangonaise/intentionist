import type { StyledComponent } from '@/components/types/StyledComponent'
import Dropdown from '@/components/app/Dropdown'
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
          minWidth: '4.8rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingX: 0,
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
      <Flex asSpan flexWrap align="center" sx={{ maxWidth: 'calc(100vw - 3rem)' }}>
        {title}{selected && <CheckMark />}
        <Text
          sx={{
            mt: 2, maxWidth: '8.75rem', minWidth: '100%',
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