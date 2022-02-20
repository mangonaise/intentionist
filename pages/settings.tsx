import { useMemo } from 'react'
import { useRouter } from 'next/router'
import withApp from '@/components/modular/withApp'
import SettingsPageLayout from '@/components/page/settings/SettingsPageLayout'
import ProfileSettings from '@/components/page/settings/ProfileSettings'

const PlaceholderSettingsComponent = () => {
  return (
    <div>Not implemented</div>
  )
}

export type SettingsSectionData = {
  path: 'profile' | 'plus' | 'account' | 'about'
  title: string,
  shortName?: string,
  component: () => JSX.Element
}

export const settingsSections: SettingsSectionData[] = [
  {
    path: 'profile',
    shortName: 'Profile',
    title: 'Your profile',
    component: ProfileSettings
  },
  {
    path: 'plus',
    title: 'Intentionist Plus',
    component: PlaceholderSettingsComponent
  },
  {
    path: 'account',
    title: 'Account settings',
    component: PlaceholderSettingsComponent
  },
  {
    path: 'about',
    title: 'About',
    component: PlaceholderSettingsComponent
  },
]

const SettingsPage = () => {
  const router = useRouter()
  const sectionData = useMemo(() => {
    const section = router.query.view ?? ''
    const sectionData = settingsSections.find((data) => data.path === section)
    if (sectionData) {
      return sectionData
    } else {
      router.push('/settings?view=profile', undefined, { shallow: true })
      return settingsSections[0]
    }
  }, [router.query.view])

  return (
    <SettingsPageLayout sectionData={sectionData} />
  )
}

export default withApp(SettingsPage)