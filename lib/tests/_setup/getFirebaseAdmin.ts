import * as admin from 'firebase-admin'

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'

export default function getFirebaseAdmin(projectId = 'intentionist') {
  const app = admin.initializeApp({
    projectId,
    credential: admin.credential.applicationDefault()
  })

  const db = app.firestore()
  db.settings({
    host: 'localhost',
    port: 8080
  })

  return {
    app,
    db
  }
}