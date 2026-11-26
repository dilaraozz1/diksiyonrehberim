import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  ActivityType,
  DialogueLevel,
  PronunciationEvaluation,
  StudentActivityRecord,
  StudentProfile,
} from './types';

export const ADMIN_EMAIL = 'dilaraozz@gmail.com';
export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
const STUDENT_EMAIL_DOMAIN = 'ogrenci.turkcediksiyon.app';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Validate connection to Firestore on startup
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function isAdminUser(user: User | null): boolean {
  if (!user) return false;
  return user.email === ADMIN_EMAIL && user.emailVerified === true;
}

/**
 * Normalizes a student username to match blueprint pattern ^[a-z0-9._-]{3,32}$
 */
export function normalizeUsername(raw: string): string {
  const trMap: Record<string, string> = {
    ç: 'c',
    ğ: 'g',
    ı: 'i',
    İ: 'i',
    ö: 'o',
    ş: 's',
    ü: 'u',
    Ç: 'c',
    Ğ: 'g',
    Ö: 'o',
    Ş: 's',
    Ü: 'u',
  };
  const replaced = raw
    .trim()
    .split('')
    .map((ch) => trMap[ch] ?? ch)
    .join('')
    .toLowerCase();

  return replaced.replace(/[^a-z0-9._-]/g, '').slice(0, 32);
}

export function isValidUsername(username: string): boolean {
  return /^[a-z0-9._-]{3,32}$/.test(username);
}

export function usernameToEmail(username: string): string {
  if (username.includes('@')) {
    return username.trim().toLowerCase();
  }
  return `${normalizeUsername(username)}@${STUDENT_EMAIL_DOMAIN}`;
}

function buildDefaultUsernameFromUser(user: User): string {
  if (user.email) {
    const prefix = normalizeUsername(user.email.split('@')[0] || 'ogrenci');
    if (prefix.length >= 3) return prefix;
  }
  return `ogr_${user.uid.slice(0, 8).toLowerCase()}`;
}

function clampString(val: string, maxLen: number): string {
  return (val || '').trim().slice(0, maxLen);
}

function clampNumber(val: number, min: number, max: number): number {
  if (!Number.isFinite(val)) return min;
  return Math.max(min, Math.min(max, val));
}

/**
 * Ensures a Firestore /students/{uid} profile document exists for the signed-in user.
 */
export async function ensureStudentProfile(
  user: User,
  overrides?: {
    username?: string;
    displayName?: string;
    targetLevel?: DialogueLevel;
  }
): Promise<StudentProfile> {
  const path = `students/${user.uid}`;
  const docRef = doc(db, 'students', user.uid);

  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as StudentProfile;
    }

    const rawUsername = overrides?.username
      ? normalizeUsername(overrides.username)
      : buildDefaultUsernameFromUser(user);
    const safeUsername = isValidUsername(rawUsername)
      ? rawUsername
      : `ogr_${user.uid.slice(0, 8).toLowerCase()}`;

    const safeDisplayName = clampString(
      overrides?.displayName || user.displayName || safeUsername,
      80
    );
    const safeLevel: DialogueLevel = overrides?.targetLevel || 'A1';

    const newProfilePayload = {
      uid: user.uid,
      username: safeUsername,
      displayName: safeDisplayName || 'Öğrenci',
      targetLevel: safeLevel,
      role: 'student' as const,
      totalAttempts: 0,
      firstScore: 0,
      latestScore: 0,
      bestScore: 0,
      averageAccuracy: 0,
      averageFluency: 0,
      growthDelta: 0,
      totalPracticeSeconds: 0,
      perfectWordsCount: 0,
      firstActivityAt: '',
      lastActivityAt: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(docRef, newProfilePayload);
    return {
      ...newProfilePayload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function registerStudentWithUsername(params: {
  username: string;
  password: string;
  displayName: string;
  targetLevel: DialogueLevel;
}): Promise<StudentProfile> {
  const cleanUsername = normalizeUsername(params.username);
  if (!isValidUsername(cleanUsername)) {
    throw new Error('Kullanıcı adı en az 3 karakter olmalı ve sadece harf, rakam, nokta, tire veya alt çizgi içermelidir.');
  }
  const email = usernameToEmail(cleanUsername);
  const credential = await createUserWithEmailAndPassword(auth, email, params.password);
  const safeDisplayName = clampString(params.displayName, 80) || cleanUsername;
  await updateProfile(credential.user, { displayName: safeDisplayName });

  return ensureStudentProfile(credential.user, {
    username: cleanUsername,
    displayName: safeDisplayName,
    targetLevel: params.targetLevel,
  });
}

export async function loginStudentWithUsername(
  usernameOrEmail: string,
  password: string
): Promise<StudentProfile> {
  const email = usernameToEmail(usernameOrEmail);
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return ensureStudentProfile(credential.user, {
    username: usernameOrEmail.includes('@')
      ? usernameOrEmail.split('@')[0]
      : usernameOrEmail,
  });
}

export async function loginWithGoogle(): Promise<StudentProfile> {
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  return ensureStudentProfile(credential.user);
}

export async function logoutStudent(): Promise<void> {
  await signOut(auth);
}

export async function updateStudentSettings(
  uid: string,
  displayName: string,
  targetLevel: DialogueLevel
): Promise<void> {
  const path = `students/${uid}`;
  const docRef = doc(db, 'students', uid);
  try {
    await updateDoc(docRef, {
      displayName: clampString(displayName, 80) || 'Öğrenci',
      targetLevel,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Atomically saves a new pronunciation/diction activity under /students/{uid}/activities/{activityId}
 * and updates the student's cumulative growth summary on /students/{uid}.
 */
export async function recordStudentActivity(params: {
  uid: string;
  profile: StudentProfile;
  activityType: ActivityType;
  contextTitle: string;
  evaluation: PronunciationEvaluation;
}): Promise<StudentActivityRecord> {
  const { uid, profile, activityType, contextTitle, evaluation } = params;
  const activityId = `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const nowIso = new Date().toISOString();

  const nextAttemptNumber = Math.max(1, (profile.totalAttempts || 0) + 1);
  const accuracy = Math.round(clampNumber(evaluation.accuracyScore, 0, 100));
  const fluency = Math.round(clampNumber(evaluation.fluencyScore, 0, 100));
  const wpm = Math.round(clampNumber(evaluation.wordsPerMinute, 0, 400));
  const durationSec = Number(clampNumber(evaluation.durationSeconds, 0.5, 600).toFixed(1));
  const perfectWords = Math.round(
    clampNumber(
      evaluation.words.filter((w) => w.status === 'correct').length,
      0,
      200
    )
  );
  const totalWords = Math.max(1, Math.min(200, evaluation.words.length || 1));
  const avgVol = Math.round(
    clampNumber(evaluation.acousticMetrics?.averageVolumePercent ?? 0, 0, 100)
  );
  const intonationLabel = clampString(
    evaluation.acousticMetrics?.intonationLabel || 'Ölçülemedi',
    40
  );
  const problemPhonemes = Array.from(
    new Set(evaluation.detectedDictionTips.map((t) => clampString(t.phoneme, 4)).filter(Boolean))
  ).slice(0, 10);

  const activityDocPayload = {
    activityId,
    studentId: uid,
    attemptNumber: nextAttemptNumber,
    activityType,
    contextTitle: clampString(contextTitle || 'Türkçe Pratik', 140),
    targetSentence: clampString(evaluation.targetSentence || '-', 500),
    spokenSentence: clampString(evaluation.spokenSentence || '', 500),
    accuracyScore: accuracy,
    fluencyScore: fluency,
    wordsPerMinute: wpm,
    durationSeconds: durationSec,
    perfectWords,
    totalWords,
    averageVolumePercent: avgVol,
    intonationLabel,
    problemPhonemes,
    createdAt: serverTimestamp(),
  };

  // Compute updated cumulative stats from the student's very first activity
  const prevAttempts = profile.totalAttempts || 0;
  const firstScore = prevAttempts === 0 ? accuracy : profile.firstScore;
  const latestScore = accuracy;
  const bestScore = prevAttempts === 0 ? accuracy : Math.max(profile.bestScore, accuracy);
  const averageAccuracy = Math.round(
    clampNumber((profile.averageAccuracy * prevAttempts + accuracy) / nextAttemptNumber, 0, 100)
  );
  const averageFluency = Math.round(
    clampNumber((profile.averageFluency * prevAttempts + fluency) / nextAttemptNumber, 0, 100)
  );
  const growthDelta = Math.round(clampNumber(latestScore - firstScore, -100, 100));
  const totalPracticeSeconds = Number(
    clampNumber((profile.totalPracticeSeconds || 0) + durationSec, 0, 10000000).toFixed(1)
  );
  const perfectWordsCount = Math.round(
    clampNumber((profile.perfectWordsCount || 0) + perfectWords, 0, 10000000)
  );
  const firstActivityAt = profile.firstActivityAt ? profile.firstActivityAt : nowIso;

  const studentRef = doc(db, 'students', uid);
  const activityRef = doc(db, 'students', uid, 'activities', activityId);

  const batch = writeBatch(db);
  batch.set(activityRef, activityDocPayload);
  batch.update(studentRef, {
    totalAttempts: nextAttemptNumber,
    firstScore,
    latestScore,
    bestScore,
    averageAccuracy,
    averageFluency,
    growthDelta,
    totalPracticeSeconds,
    perfectWordsCount,
    firstActivityAt,
    lastActivityAt: nowIso,
    updatedAt: serverTimestamp(),
  });

  try {
    await batch.commit();
    return {
      ...activityDocPayload,
      createdAtMs: Date.now(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `students/${uid}/activities/${activityId}`);
  }
}

function extractTimestampMs(value: unknown): number {
  if (value instanceof Timestamp) {
    return value.toMillis();
  }
  if (typeof value === 'object' && value !== null && 'toMillis' in value) {
    try {
      return (value as { toMillis: () => number }).toMillis();
    } catch {
      return Date.now();
    }
  }
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? Date.now() : parsed;
  }
  return Date.now();
}

export function subscribeStudentProfile(
  uid: string,
  onUpdate: (profile: StudentProfile | null) => void
): () => void {
  const path = `students/${uid}`;
  return onSnapshot(
    doc(db, 'students', uid),
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as StudentProfile);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeStudentActivities(
  uid: string,
  onUpdate: (activities: StudentActivityRecord[]) => void
): () => void {
  const path = `students/${uid}/activities`;
  // Enforce studentId filter matching Firestore list security rule
  const q = query(collection(db, 'students', uid, 'activities'), where('studentId', '==', uid));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: StudentActivityRecord[] = snapshot.docs.map((d) => {
        const data = d.data() as StudentActivityRecord;
        return {
          ...data,
          createdAtMs: extractTimestampMs(data.createdAt),
        };
      });
      // Sort chronologically from first activity (#1) to latest
      list.sort((a, b) => a.attemptNumber - b.attemptNumber || (a.createdAtMs || 0) - (b.createdAtMs || 0));
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeAllStudentsForAdmin(
  onUpdate: (students: StudentProfile[]) => void
): () => void {
  const path = 'students';
  return onSnapshot(
    collection(db, 'students'),
    (snapshot) => {
      const students = snapshot.docs.map((d) => d.data() as StudentProfile);
      students.sort((a, b) => {
        const timeA = a.lastActivityAt ? Date.parse(a.lastActivityAt) : 0;
        const timeB = b.lastActivityAt ? Date.parse(b.lastActivityAt) : 0;
        return timeB - timeA || b.totalAttempts - a.totalAttempts;
      });
      onUpdate(students);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function fetchStudentActivitiesForAdmin(
  studentId: string
): Promise<StudentActivityRecord[]> {
  const path = `students/${studentId}/activities`;
  try {
    const snap = await getDocs(collection(db, 'students', studentId, 'activities'));
    const list: StudentActivityRecord[] = snap.docs.map((d) => {
      const data = d.data() as StudentActivityRecord;
      return {
        ...data,
        createdAtMs: extractTimestampMs(data.createdAt),
      };
    });
    list.sort((a, b) => a.attemptNumber - b.attemptNumber || (a.createdAtMs || 0) - (b.createdAtMs || 0));
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}
