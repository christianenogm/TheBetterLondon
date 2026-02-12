export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    FIREBASE_API_KEY: process.env.FIREBASE_apiKey,
    FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_authDomain,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_projectId,
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_storageBucket,
    FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_messagingSenderId,
    FIREBASE_APP_ID: process.env.FIREBASE_appId,
    FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_measurementId,
  },
});
