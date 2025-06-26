// Alternative Firebase config that uses environment variables
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app" // Import FirebaseApp type
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getAnalytics, isSupported } from "firebase/analytics"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase
// Check if Firebase has already been initialized
let app: FirebaseApp // Declare app with FirebaseApp type

if (!getApps().length) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApp() // if already initialized, use that one
}

// Initialize services
export const db = getFirestore(app)
export const auth = getAuth(app)

// Initialize Analytics
export const initializeAnalytics = async () => {
  if (typeof window !== "undefined") {
    const analyticsSupported = await isSupported()
    if (analyticsSupported) {
      return getAnalytics(app)
    }
  }
  return null
}

export { app } // Named export for app
export default app // Keep default export for compatibility if used elsewhere
