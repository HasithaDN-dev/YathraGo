import { admin } from './firebase.config';

/**
 * Simple test to verify Firebase Admin SDK initialization
 * Run this file to check if Firebase is properly configured
 */
async function testFirebaseConfig() {
  try {
    console.log('🔥 Testing Firebase Admin SDK Configuration...\n');

    // Check if admin is initialized
    if (!admin) {
      throw new Error('Firebase Admin SDK is not initialized');
    }

    // Check if the app is initialized
    const app = admin.app();
    console.log('✅ Firebase Admin SDK initialized successfully');
    console.log(`   Project ID: ${app.options.projectId || 'Not set'}`);

    // Check if messaging is available
    const messaging = admin.messaging();
    console.log('✅ Firebase Cloud Messaging (FCM) is available');

    // Check if the credential is set
    if (app.options.credential) {
      console.log('✅ Firebase credentials loaded successfully');
    }

    console.log('\n🎉 All Firebase configuration checks passed!');
    console.log('\nYou can now use Firebase Admin SDK for:');
    console.log('  - Sending push notifications');
    console.log('  - Managing FCM tokens');
    console.log('  - Sending to topics or individual devices');

    return true;
  } catch (error) {
    console.error('❌ Firebase configuration test failed:');
    console.error(error);
    return false;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testFirebaseConfig()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}

export { testFirebaseConfig };
