# Security Specification — Türkçe Telaffuz & Diksiyon Asistanı

## Data Invariants
1. **Student Ownership & Isolation**: A student profile `/students/{studentId}` can only be created, read, or updated by its owner (`studentId == request.auth.uid`) or a verified Admin/Teacher (`isBootstrappedAdmin()` or `/admins/{uid}`). Students cannot list or read other students' profiles.
2. **No Self-Assigned Admin Role**: During student profile creation, `role` MUST equal `'student'`. During updates by a student, `role`, `uid`, `username`, and `createdAt` are strictly immutable.
3. **Master Gate for Activities**: A `/students/{studentId}/activities/{activityId}` document cannot be created unless its parent `/students/{studentId}` document exists and `studentId == request.auth.uid`.
4. **Immutable Activity History**: Activity records are append-only historical proof of progress from Attempt #1 onward; clients cannot `update` or `delete` past activities (only admins may delete).
5. **Server Timestamps & Bounded Payloads**: `createdAt` on create and `updatedAt` on update MUST equal `request.time`. Every string and list has explicit `.size()` constraints and IDs match `^[a-zA-Z0-9_\-]+$`.
6. **Verified Admin Email Guard**: Any email-based admin match strictly enforces `request.auth.token.email_verified == true` to prevent email spoofing.

## The Dirty Dozen Attack Payloads (All Must Return PERMISSION_DENIED)
1. **Self-Assigned Admin Role on Create**: Student creates `/students/{uid}` with `role: 'admin'`.
2. **Role Escalation on Update**: Student updates `/students/{uid}` attempting to change `role` to `'admin'`.
3. **Shadow Field Injection on Profile**: Student creates/updates `/students/{uid}` adding ghost field `isVerified: true`.
4. **Cross-Student Profile Read**: Student A tries to `get` `/students/{studentB}`.
5. **Blanket Student List Scraping**: Student A tries to `list` `/students`.
6. **Orphan Activity Create**: Student creates `/students/{uid}/activities/{actId}` before `/students/{uid}` exists.
7. **Activity Identity Spoofing**: Student A tries to create `/students/{studentB}/activities/{actId}` with `studentId: studentB`.
8. **Historical Activity Tampering**: Student tries to `update` an existing activity's `accuracyScore` from `40` to `100`.
9. **Client Timestamp Forgery**: Student creates an activity with `createdAt` set to a past client timestamp instead of `request.time`.
10. **Oversized Array / Resource Exhaustion**: Student sends `problemPhonemes` with 25 items or a 2KB `targetSentence`.
11. **Path ID Poisoning**: Student attempts to create an activity with an invalid path ID containing spaces or >128 chars.
12. **Unverified Admin Email Spoofing**: User with `email: 'dilaraozz@gmail.com'` and `email_verified: false` tries to list `/students`.
