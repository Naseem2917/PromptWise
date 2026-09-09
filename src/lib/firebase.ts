import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCc5vglGSaq7qT2EgM-Q4jQg3Kin2hwljs',
  authDomain: 'promptwise-app.firebaseapp.com',
  projectId: 'promptwise-app',
  storageBucket: 'promptwise-app.firebasestorage.app',
  messagingSenderId: '80934405858',
  appId: '1:80934405858:web:e70ff1c5fa1436d62480bb',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
