import { useMemo } from 'react'
import { SettingsSectionData, settingsSections } from 'pages/settings/[...section]'
import useMediaQuery from '@/lib/hooks/useMediaQuery'
import Dropdown from '@/components/app/Dropdown'
import Flex from '@/components/primitives/Flex'
import Heading from '@/components/primitives/Heading'
import Link from '@/components/primitives/Link'
import IconButton from '@/components/primitives/IconButton'
import BackIcon from '@/components/icons/BackIcon'
import NextLink from 'next/link'

const SettingsPageLayout = ({ sectionData }: { sectionData: SettingsSectionData }) => {
  const showSidebar = useMediaQuery('(min-width: 750px)', true, false)

  return (
    <Flex column={!showSidebar} sx={{ maxWidth: '900px', margin: 'auto' }}>
      {showSidebar
        ? <SectionsSidebar activeSectionPath={sectionData.path} />
        : <SectionsDropdown dropdownTitle={sectionData.shortName ?? sectionData.title} />}
      <Flex column sx={{ flex: 1 }}>
        <Heading
          level={2}
          sx={{
            paddingBottom: 3,
            fontSize: ['1.5rem', '2rem'],
            borderBottom: 'solid 1px',
            borderColor: 'divider'
          }}
        >
          {sectionData.title}
        </Heading>
      </Flex>
    </Flex>
  )
}

const SectionsSidebar = ({ activeSectionPath }: { activeSectionPath: SettingsSectionData['path'] }) => {
  const sectionIndex = useMemo(() => {
    return settingsSections.indexOf(settingsSections.find(data => data.path === activeSectionPath)!)
  }, [activeSectionPath])

  return (
    <Flex column sx={{ width: '25%', mr: 6 }}>
      <Flex sx={{ mb: 2 }}>
        <NextLink href="/home">
          <IconButton icon={BackIcon} sx={{ bg: 'transparent' }} />
        </NextLink>
      </Flex>
      <Flex
        column
        sx={{
          position: 'relative',
          '&::before': {
            position: 'absolute', content: '""', inset: 0,
            top: `calc(${sectionIndex / settingsSections.length} * 100%)`,
            height: `calc(100% / ${settingsSections.length})`,
            borderRadius: 'default',
            backgroundColor: 'whiteAlpha.10',
            transition: 'top 250ms cubic-bezier(0, 0, 0.15, 1.0)'
          }
        }}
      >
        {settingsSections.map((sectionData) => (
          <SidebarItem
            title={sectionData.shortName ?? sectionData.title}
            path={sectionData.path}
            isActive={sectionData.path === activeSectionPath}
            key={sectionData.path}
          />
        ))}
      </Flex>
    </Flex>
  )
}

const SidebarItem = ({ title, path, isActive }: { title: string, path: string, isActive: boolean }) => {
  return (
    <NextLink href={`/settings/${path}`} passHref>
      <Link
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: '2.5rem',
          paddingLeft: 3,
          fontSize: '1.15rem',
          borderRadius: 'default',
          color: isActive ? 'text' : 'whiteAlpha.50',
          '&:hover': { textDecoration: 'none', opacity: 1 }
        }}
      >
        {title}
      </Link>
    </NextLink>

  )
}

const SectionsDropdown = ({ dropdownTitle }: { dropdownTitle: string }) => {
  return (
    <Flex align="center" sx={{ mb: 2 }}>
      <NextLink href="/home">
        <IconButton icon={BackIcon} sx={{ bg: 'transparent' }} />
      </NextLink>
      <Dropdown title={dropdownTitle} sx={{ ml: 2, flex: 1 }}>
        {settingsSections.map((sectionData) => (
          <Dropdown.Item href={`/settings/${sectionData.path}`} key={sectionData.path}>
            {sectionData.shortName ?? sectionData.title}
          </Dropdown.Item>
        ))}
      </Dropdown>
    </Flex>
  )
}

export default SettingsPageLayout