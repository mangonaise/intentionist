import admin = require('firebase-admin')

admin.initializeApp()

export * from './functions/onUpdateUserDocument'