import admin = require('firebase-admin')

admin.initializeApp()

exports.onSetUsername = require('./functions/onSetUsername')