import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

// filename of the Firebase service account JSON
const FILENAME = 'yathragonotifications-firebase-adminsdk-fbsvc-7b2172c106.json';

// Build candidate paths (supports running from src (ts-node), dist (compiled), and env override)
const candidates: string[] = [];

// 1) explicit env var (absolute or relative to project root)
if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  const p = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  // if relative, make absolute relative to cwd
  candidates.push(path.isAbsolute(p) ? p : path.join(process.cwd(), p));
}

// 2) path next to this file (works for both src and dist if file is copied)
candidates.push(path.join(__dirname, FILENAME));

// 3) common/config in project src (source location)
candidates.push(path.join(process.cwd(), 'src', 'common', 'config', FILENAME));

// 4) common/services in project src
candidates.push(path.join(process.cwd(), 'src', 'common', 'services', FILENAME));

// 5) compiled dist locations
candidates.push(path.join(process.cwd(), 'dist', 'common', 'services', FILENAME));
candidates.push(path.join(process.cwd(), 'dist', 'common', 'config', FILENAME));

// Find first existing candidate
let serviceAccountPath: string | null = null;
for (const c of candidates) {
  try {
    if (fs.existsSync(c)) {
      serviceAccountPath = c;
      break;
    }
  } catch (err) {
    // ignore
  }
}

// Initialize Firebase Admin SDK if possible. Do not throw on missing file — log and continue.
if (!admin.apps.length) {
  if (!serviceAccountPath) {
    console.warn('⚠️  Firebase service account JSON not found. Checked paths:');
    for (const c of candidates) console.warn(`   - ${c}`);
    console.warn('ℹ️  To enable Firebase, set FIREBASE_SERVICE_ACCOUNT_PATH in your environment or place the JSON file in one of the listed paths.');
  } else {
    try {
      const json = fs.readFileSync(serviceAccountPath, 'utf8');
      const serviceAccount = JSON.parse(json) as ServiceAccount;

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: (serviceAccount as any).project_id ?? serviceAccount.projectId ?? 'yathragonotifications',
      });

      console.log(`✅ Firebase Admin SDK initialized successfully from: ${serviceAccountPath}`);
    } catch (err) {
      console.error('❌ Failed to initialize Firebase Admin SDK:', err);
    }
  }
} else {
  console.log('ℹ️  Firebase Admin SDK already initialized');
}

export { admin };
