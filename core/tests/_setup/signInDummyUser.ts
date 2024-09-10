import AuthHandler from '@/logic/app/AuthHandler'
import { GoogleAuthProvider, signInWithCredential } from '@firebase/auth'
import { container } from 'tsyringe'

async function signInDummyUser(seed?: string) {
  seed = seed ?? Date.now().toString()
  const dummyCredential = `{"sub": "${seed}", "email": "dummy@example${seed}.com", "email_verified": true}`
  const auth = container.resolve(AuthHandler).auth
  const credential = await signInWithCredential(auth, GoogleAuthProvider.credential(dummyCredential))
  return credential.user
}

export default signInDummyUser