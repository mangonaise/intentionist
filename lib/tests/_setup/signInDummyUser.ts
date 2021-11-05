import AuthHandler from '@/logic/app/AuthHandler'
import { GoogleAuthProvider, signInWithCredential } from '@firebase/auth'
import { container } from 'tsyringe'

const dummyCredential = '{"sub": "abc123", "email": "dummy@example.com", "email_verified": true}'

async function signInDummyUser() {
  const auth = container.resolve(AuthHandler).auth
  const credential = await signInWithCredential(auth, GoogleAuthProvider.credential(dummyCredential))
  return credential.user
}

export default signInDummyUser