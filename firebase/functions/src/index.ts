import admin = require('firebase-admin')

admin.initializeApp()

exports.onUpdateUserDocument = require('./functions/onUpdateUserDocument')