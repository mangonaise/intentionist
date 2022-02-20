import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import ProfileHandler from '@/logic/app/ProfileHandler'
import UserProfileEditor from '@/components/modular/UserProfileEditor'

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