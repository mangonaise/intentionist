import admin = require('firebase-admin')

admin.initializeApp()

export * from './triggers/onUpdateUserDocument'
export * from './callables/sendFriendRequest'
export * from './callables/cancelOutgoingFriendRequest'
export * from './callables/respondToFriendRequest'
export * from './callables/removeFriend'