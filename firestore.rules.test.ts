/**
 * Phase 0 Payload-First Security TDD Specification for firestore.rules.
 * Verifies that all 12 "Dirty Dozen" adversarial payloads are rejected
 * by the hardened Firestore security rules.
 */

export interface DirtyDozenTestCase {
  id: number;
  name: string;
  collectionPath: string;
  operation: 'create' | 'update' | 'get' | 'list' | 'delete';
  auth: { uid: string; email?: string; email_verified?: boolean; provider?: string } | null;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TESTS: DirtyDozenTestCase[] = [
  {
    id: 1,
    name: 'Self-Assigned Admin Role on Profile Create',
    collectionPath: '/students/studentA',
    operation: 'create',
    auth: { uid: 'studentA', provider: 'password' },
    payload: { uid: 'studentA', username: 'ahmet', displayName: 'Ahmet', targetLevel: 'A1', role: 'admin' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Role Escalation on Profile Update',
    collectionPath: '/students/studentA',
    operation: 'update',
    auth: { uid: 'studentA', provider: 'password' },
    payload: { role: 'admin' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Shadow Ghost Field Injection on Profile',
    collectionPath: '/students/studentA',
    operation: 'update',
    auth: { uid: 'studentA', provider: 'password' },
    payload: { displayName: 'Ahmet', isVerified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Cross-Student Profile Read (PII/Progress Leak)',
    collectionPath: '/students/studentB',
    operation: 'get',
    auth: { uid: 'studentA', provider: 'password' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Unauthorized Student Directory Listing',
    collectionPath: '/students',
    operation: 'list',
    auth: { uid: 'studentA', provider: 'password' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Orphan Activity Write Without Parent Student Profile',
    collectionPath: '/students/orphanUid/activities/act1',
    operation: 'create',
    auth: { uid: 'orphanUid', provider: 'password' },
    payload: { activityId: 'act1', studentId: 'orphanUid', accuracyScore: 80 },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Activity Identity Spoofing Under Another Student',
    collectionPath: '/students/studentB/activities/act2',
    operation: 'create',
    auth: { uid: 'studentA', provider: 'password' },
    payload: { activityId: 'act2', studentId: 'studentB', accuracyScore: 95 },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Tampering with Historical Activity Score',
    collectionPath: '/students/studentA/activities/act1',
    operation: 'update',
    auth: { uid: 'studentA', provider: 'password' },
    payload: { accuracyScore: 100 },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Client Timestamp Forgery on Activity Create',
    collectionPath: '/students/studentA/activities/act3',
    operation: 'create',
    auth: { uid: 'studentA', provider: 'password' },
    payload: { activityId: 'act3', studentId: 'studentA', createdAt: '2020-01-01T00:00:00Z' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Array / String Size Exhaustion Attack',
    collectionPath: '/students/studentA/activities/act4',
    operation: 'create',
    auth: { uid: 'studentA', provider: 'password' },
    payload: {
      activityId: 'act4',
      studentId: 'studentA',
      targetSentence: 'a'.repeat(1500),
      problemPhonemes: Array(25).fill('ğ'),
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Path Variable ID Poisoning',
    collectionPath: `/students/studentA/activities/${'x'.repeat(200)}`,
    operation: 'create',
    auth: { uid: 'studentA', provider: 'password' },
    payload: { activityId: 'x'.repeat(200), studentId: 'studentA' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Unverified Admin Email Spoofing',
    collectionPath: '/students',
    operation: 'list',
    auth: { uid: 'attacker', email: 'dilaraozz@gmail.com', email_verified: false },
    expected: 'PERMISSION_DENIED',
  },
];
