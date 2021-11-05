import type { Auth } from 'firebase/auth'
import { inject, singleton } from 'tsyringe'

@singleton()
export default class AuthUser {
  uid
  displayName

  constructor(@inject('Auth') auth: Auth) {
    if (!auth.currentUser) {
      throw new Error('Cannot construct AuthUser when not authenticated')
    }
    this.uid = auth.currentUser.uid
    this.displayName = auth.currentUser.displayName
  }
}