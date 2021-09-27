import { auth } from '../../firebase';
import { singleton } from 'tsyringe';

@singleton()
export default class AuthUser {
  uid
  displayName

  constructor() {
    if (!auth.currentUser) {
      throw new Error('Cannot construct AuthUser when not authenticated')
    }
    this.uid = auth.currentUser.uid
    this.displayName = auth.currentUser.displayName
  }
}