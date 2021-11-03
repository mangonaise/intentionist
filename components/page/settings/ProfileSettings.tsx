import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import ProfileHandler from '@/lib/logic/app/ProfileHandler'
import UserProfileEditor from '@/components/app/UserProfileEditor'

const ProfileSettings = observer(() => {
  const { profileInfo } = container.resolve(ProfileHandler)

  return (
    <UserProfileEditor
      initialProfile={profileInfo!}
      isNewUser={false}
    />
  )
})

export default ProfileSettings