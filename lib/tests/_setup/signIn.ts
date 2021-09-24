import { auth } from '../../firebase'
import { GoogleAuthProvider, signInWithCredential } from '@firebase/auth'

const dummyCredential = '{"sub": "abc123", "email": "dummy@example.com", "email_verified": true}'

async function signInDummyUser() {
  await signInWithCredential(auth, GoogleAuthProvider.credential(dummyCredential))
}

export default signInDummyUser