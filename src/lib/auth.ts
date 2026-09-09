import { GoogleAuthProvider, signInWithPopup, signOut as fbSignOut } from 'firebase/auth'
import { auth } from './firebase'

const provider = new GoogleAuthProvider()

/** Open Google Sign-In popup */
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, provider)
  return result.user
}

/** Sign out the current user */
export async function signOut() {
  await fbSignOut(auth)
}
