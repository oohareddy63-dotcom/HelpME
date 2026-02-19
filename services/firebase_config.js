// Mock Firebase Admin SDK for development
// In production, replace with actual Firebase service account key

const admin = {
  messaging: () => ({
    sendToDevice: async (token, payload, options) => {
      console.log('Mock FCM notification sent:', { token, payload, options });
      // Simulate successful notification
      return { success: true };
    }
  }),
  initializeApp: () => {
    console.log('Firebase Admin initialized (mock)');
  }
};

// Mock the service account requirement
const serviceAccount = {
  // Mock service account data
  type: "service_account",
  project_id: "help-me-mock",
  private_key_id: "mock-key-id",
  private_key: "-----BEGIN PRIVATE KEY-----\nmock\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk@help-me-mock.iam.gserviceaccount.com",
  client_id: "mock-client-id",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk%40help-me-mock.iam.gserviceaccount.com"
};

admin.initializeApp({
  credential: {
    cert: () => serviceAccount
  },
  databaseURL: "https://help-me-mock.firebaseio.com",
});

module.exports.admin = admin;