import { auth } from '../../firebase'
import { GoogleAuthProvider, signInWithCredential } from '@firebase/auth'

const dummyCredential = '{"sub": "abc123", "email": "dummy@example.com", "email_verified": true}'

async function signInDummyUser() {
  const credential = await signInWithCredential(auth, GoogleAuthProvider.credential(dummyCredential))
  return credential.user
}

export default signInDummyUser