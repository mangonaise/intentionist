import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { Button, Flex, Icon } from '@/components/primitives'
import { EyeHiddenIcon, EyeIcon } from '@/components/icons'
import WeekHandler from '@/lib/logic/app/WeekHandler'
import accentColor from '@/lib/logic/utils/accentColor'

const CondenseViewToggle = () => {
  const { condenseView, setCondensedView, showCondenseViewToggle } = container.resolve(WeekHandler)

  return (
    <Flex center sx={{ height: 'row' }}>
      {showCondenseViewToggle && (
        <Button
          onClick={() => setCondensedView(!condenseView)}
          title={condenseView ? 'Empty rows are hidden' : 'Empty rows are visible'}
          sx={{
            position: 'relative',
            size: '100%',
            minWidth: '3.75rem',
            p: 0,
            bg: 'transparent',
            '& svg': {
              color: accentColor.current,
            },
            '&:hover': {
              '&::before': {
                position: 'absolute',
                content: '""',
                inset: '3px',
                borderRadius: 'default',
                backgroundColor: 'buttonHighlight'
              }
            }
          }}
          hoverEffect="none"
        >
          <Flex center>
            <Icon
              icon={condenseView ? EyeHiddenIcon : EyeIcon}
              sx={{ transform: 'scale(1.75)', '& svg': { transition: 'color 150ms' }}}
            />
          </Flex>
        </Button>
      )}
    </Flex>
  )
}

export default observer(CondenseViewToggle)