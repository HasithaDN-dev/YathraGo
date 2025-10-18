import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

// Path to Firebase service account credentials
// Use path.join to go from src/common/services -> src/common/config
const serviceAccountPath = path.join(
  __dirname,
  '..',
  'config',
  'yathragonotifications-firebase-adminsdk-fbsvc-7b2172c106.json',
);

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    fs.readFileSync(serviceAccountPath, 'utf8'),
  ) as ServiceAccount;

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'yathragonotifications',
  });

  console.log('✅ Firebase Admin SDK initialized successfully');
} else {
  console.log('ℹ️  Firebase Admin SDK already initialized');
}

export { admin };
