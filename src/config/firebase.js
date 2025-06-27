import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Firebase configuration
// You'll need to replace these with your actual Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyAhhZhSl3_miWy9erpNc_Hg-tseOCGBAqQ",
  authDomain: "companion-afef7.firebaseapp.com",
  projectId: "companion-afef7",
  storageBucket: "companion-afef7.firebasestorage.app",
  messagingSenderId: "151052836594",
  appId: "1:151052836594:web:8520fb54af4a95dab63a6b",
  measurementId: "G-CK6DCPY0ND"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

export default app
