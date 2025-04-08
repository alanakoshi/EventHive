// backend/firebaseAdmin.js
const admin = require('firebase-admin');

// Download your service account key JSON from the Firebase Console and place it in your backend folder.
const serviceAccount = require('./path-to-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://your-app.firebaseio.com'
});

module.exports = admin;
