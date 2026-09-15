import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp,
  setDoc,
  getDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore'
import type { User } from 'firebase/auth'
import { db } from './firebase'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PromptRecord {
  id: string
  userId: string
  originalPrompt: string
  improvedPrompt: string
  scoreBefore: number
  scoreAfter: number
  saved: boolean
  createdAt: Timestamp | null
}

export interface FeedbackRecord {
  userId?: string
  promptId?: string
  rating?: 'up' | 'down' | number | string
  message: string
  category?: string
  email?: string
  originalPrompt?: string
  improvedPrompt?: string
}

// ── User ──────────────────────────────────────────────────────────────────────

/** Create user profile on first sign-in (no-op if already exists) */
export async function upsertUser(user: User): Promise<void> {
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      name: user.displayName ?? '',
      email: user.email ?? '',
      photoURL: user.photoURL ?? '',
      createdAt: serverTimestamp(),
    })
  }
}

// ── Prompts ───────────────────────────────────────────────────────────────────

/** Save an improved prompt to Firestore, returns its document ID */
export async function savePrompt(
  userId: string,
  data: {
    originalPrompt: string
    improvedPrompt: string
    scoreBefore: number
    scoreAfter: number
  },
): Promise<string> {
  const ref = await addDoc(collection(db, 'prompts'), {
    userId,
    ...data,
    saved: false,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

/** Toggle the "bookmarked" saved status of a prompt */
export async function toggleSavePrompt(promptId: string, saved: boolean): Promise<void> {
  await updateDoc(doc(db, 'prompts', promptId), { saved })
}

/** Fetch all prompts for a user, newest first */
export async function getUserPrompts(userId: string): Promise<PromptRecord[]> {
  try {
    const q = query(collection(db, 'prompts'), where('userId', '==', userId))
    const snap = await getDocs(q)
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as PromptRecord))
    return items.sort((a, b) => {
      const timeA = a.createdAt?.seconds ?? 0
      const timeB = b.createdAt?.seconds ?? 0
      return timeB - timeA
    })
  } catch (err) {
    console.error('Error fetching user prompts:', err)
    return []
  }
}

/** Fetch only saved/bookmarked prompts for a user */
export async function getSavedPrompts(userId: string): Promise<PromptRecord[]> {
  const all = await getUserPrompts(userId)
  return all.filter((p) => p.saved)
}

/** Delete a prompt from Firestore (enforces ownership when userId provided) */
export async function deletePrompt(promptId: string, userId?: string): Promise<void> {
  const ref = doc(db, 'prompts', promptId)
  if (userId) {
    const snap = await getDoc(ref)
    if (snap.exists() && snap.data().userId !== userId) {
      throw new Error('Unauthorized: You can only delete your own prompts.')
    }
  }
  await deleteDoc(ref)
}

// ── Feedback ──────────────────────────────────────────────────────────────────

/** Save user feedback to Firestore */
export async function saveFeedback(data: FeedbackRecord): Promise<void> {
  await addDoc(collection(db, 'feedback'), {
    ...data,
    createdAt: serverTimestamp(),
  })
}

/** Delete feedback from Firestore (admin only) */
export async function deleteFeedback(feedbackId: string): Promise<void> {
  await deleteDoc(doc(db, 'feedback', feedbackId))
}

// ── Practice Tracking ─────────────────────────────────────────────────────────

export async function savePracticeAttempt(
  userId: string,
  task: string,
  userPrompt: string,
  score: number,
): Promise<void> {
  await addDoc(collection(db, 'practice'), {
    userId,
    task,
    userPrompt,
    score,
    createdAt: serverTimestamp(),
  })
}

export async function getPracticeCount(userId: string): Promise<number> {
  try {
    const q = query(collection(db, 'practice'), where('userId', '==', userId))
    const snap = await getDocs(q)
    return snap.size
  } catch (err) {
    console.error('Error fetching practice count:', err)
    return 0
  }
}

// ── Quiz Results ──────────────────────────────────────────────────────────────

export async function saveQuizResult(userId: string, score: number, total: number): Promise<void> {
  await addDoc(collection(db, 'quizResults'), {
    userId,
    score,
    total,
    percentage: Math.round((score / total) * 100),
    createdAt: serverTimestamp(),
  })
}

export async function getLatestQuizScore(userId: string): Promise<number | null> {
  try {
    const q = query(collection(db, 'quizResults'), where('userId', '==', userId))
    const snap = await getDocs(q)
    if (snap.empty) return null
    const scores = snap.docs.map((d) => d.data().percentage as number)
    return scores[scores.length - 1] ?? null
  } catch (err) {
    console.error('Error fetching quiz score:', err)
    return null
  }
}

// ── Admin-only queries (Firestore rules enforce email check server-side) ──────

export interface AdminFeedbackRecord {
  id: string
  category?: string
  rating?: 'up' | 'down' | number | string
  message: string
  email?: string
  originalPrompt?: string
  improvedPrompt?: string
  promptId?: string
  createdAt: Timestamp | null
}

export interface AdminUserRecord {
  id: string
  name?: string
  email?: string
  createdAt: Timestamp | null
}

export interface AdminQuizResult {
  id: string
  score: number
  total: number
  percentage: number
  createdAt: Timestamp | null
}

/** Fetch all feedback (admin only — Firestore rules enforce email restriction) */
export async function getAllFeedback(): Promise<AdminFeedbackRecord[]> {
  const q = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      category: data.category,
      rating: data.rating,
      message: data.message,
      email: data.email,
      originalPrompt: data.originalPrompt,
      improvedPrompt: data.improvedPrompt,
      promptId: data.promptId,
      createdAt: data.createdAt ?? null,
    }
  })
}

/** Fetch all users (admin only) */
export async function getAllUsers(): Promise<AdminUserRecord[]> {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({
    id: d.id,
    name: d.data().name,
    email: d.data().email,
    createdAt: d.data().createdAt ?? null,
  }))
}

/** Fetch all quiz results (admin only) */
export async function getAllQuizResults(): Promise<AdminQuizResult[]> {
  const q = query(collection(db, 'quizResults'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({
    id: d.id,
    score: d.data().score,
    total: d.data().total,
    percentage: d.data().percentage,
    createdAt: d.data().createdAt ?? null,
  }))
}
