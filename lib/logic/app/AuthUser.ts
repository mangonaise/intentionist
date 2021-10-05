import { auth } from '../../firebase';
import { Lifecycle, scoped } from 'tsyringe';

@scoped(Lifecycle.ContainerScoped)
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