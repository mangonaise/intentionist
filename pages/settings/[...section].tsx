import { useMemo } from 'react'
import { useRouter } from 'next/router'
import withApp from '@/components/app/withApp'
import SettingsPageLayout from '@/components/page/settings/SettingsPageLayout'

export type SettingsSectionData = {
  path: 'profile' | 'about' | 'account' | 'plus',
  title: string,
  shortName?: string
}

export const settingsSections: SettingsSectionData[] = [
  {
    path: 'profile',
    shortName: 'Profile',
    title: 'Your profile'
  },
  {
    path: 'account',
    title: 'Account settings'
  },
  {
    path: 'plus',
    title: 'Intentionist Plus'
  },
  {
    path: 'about',
    title: 'About'
  },
]

const SettingsPage = () => {
  const router = useRouter()
  const sectionData = useMemo(() => {
    const section = router.query.section?.[0] ?? ''
    const sectionData = settingsSections.find((data) => data.path === section)
    if (sectionData) {
      return sectionData
    } else {
      router.push('/settings/profile', undefined, { shallow: true })
      return settingsSections[0]
    }
  }, [router.query.section])

  return (
    <SettingsPageLayout sectionData={sectionData} />
  )
}

export default withApp(SettingsPage, 'neutral')