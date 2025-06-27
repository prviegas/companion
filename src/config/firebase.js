import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAVnqrOjr4L0zje00cHPdIo3eA78QQCNmc",
  authDomain: "neurocompanion.firebaseapp.com",
  projectId: "neurocompanion",
  storageBucket: "neurocompanion.firebasestorage.app",
  messagingSenderId: "936091023481",
  appId: "1:936091023481:web:d9db2707de72bc29c7fca8",
  measurementId: "G-VKB60JS1EK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

export default app
