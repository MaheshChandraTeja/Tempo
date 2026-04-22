# Privacy Model

## Core principle

Tempo is local-first by default.

Workout entries, scan metadata, and settings remain on-device unless the user explicitly exports them.

## What data is handled

### Sensitive local data
- workout logs
- scan sessions
- OCR text
- scan-derived metrics
- cached treadmill display images
- debug artifacts if enabled

### Lower-risk local data
- daily summaries
- preferences
- runtime flags

## Permission model

Current required permission:
- Camera

Used for:
- treadmill display capture only

Rules:
- request only when needed
- make permission status visible
- audit permission state in Settings
- avoid hidden or unrelated permission usage

## Export model

Exports are:
- local
- explicit
- user-initiated
- versioned

Tempo does not automatically sync user exercise data to a server as part of the local-first model.

## Deletion model

Local data deletion must be:
- explicit
- destructive
- user-confirmed
- broad enough to remove cached images and debug artifacts when requested

Secure-delete orchestration lives in:
- `modules/privacy/secureDelete.ts`

## Privacy helpers

Key modules:
- `modules/privacy/localDataPolicy.ts`
- `modules/privacy/permissionAudit.ts`
- `modules/privacy/secureDelete.ts`

These helpers exist so privacy behavior is implemented in code, not just implied by reassuring wording.

## Threat assumptions

Tempo is not positioned as a hardened forensic-security tool.

It does aim to:
- avoid unnecessary data spread
- keep sensitive exercise data local
- make export and deletion behavior explicit
- minimize permission footprint

## Developer rules

- do not log sensitive OCR or workout data casually
- keep debug artifacts local
- do not mix privacy logic into marketing copy or UI ad hoc
- keep destructive flows auditable and deliberate