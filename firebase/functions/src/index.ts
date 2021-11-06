import admin = require('firebase-admin')

admin.initializeApp()

export * from './triggers/onUpdateUserDocument'
export * from './callables/sendFriendRequest'