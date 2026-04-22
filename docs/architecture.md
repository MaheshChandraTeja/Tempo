# Tempo Architecture

## Overview

Tempo is a local-first React Native application for workout logging, treadmill display scanning, history browsing, analytics, and export. The app is intentionally structured so that vision, persistence, business rules, and UI can evolve independently without dragging one another into avoidable chaos.

## Architectural priorities

1. Local-first behavior
2. Deterministic business logic
3. Explicit module boundaries
4. Replaceable vision/OCR integrations
5. Minimal leakage of storage or native concerns into UI

## Layered structure

### App shell

Responsible for:
- providers
- navigation
- theme
- root composition

Representative areas:
- `app/`
- `navigation/`
- `providers/`

### Features

Feature modules own user-facing workflows and view state.

Representative areas:
- `features/home`
- `features/workout-log`
- `features/history`
- `features/scan`
- `features/settings`

Rules:
- features can depend on domain modules, shared components, storage services, and vision modules
- feature screens should not own raw SQL, OCR engine details, or native frame processing logic

### Vision subsystem

The vision subsystem handles:
- camera abstraction
- OCR abstraction
- treadmill parsing
- scan pipeline orchestration
- native/plugin boundaries

Representative areas:
- `vision/camera`
- `vision/ocr`
- `vision/treadmill`
- `vision/pipeline`
- `vision/native`

Rules:
- business screens must consume stable outputs from the pipeline, not vendor APIs
- OCR engines must remain replaceable
- treadmill parsing stays rule-based and deterministic in v1

### Storage subsystem

The storage subsystem is the app’s effective backend.

Representative areas:
- `storage/db`
- `storage/files`
- `storage/kv`

Responsibilities:
- migrations
- repositories
- local files
- runtime preferences
- export persistence helpers

Rules:
- screens do not speak SQL
- repositories return domain-shaped records
- destructive operations must be explicit and auditable

### Business modules

Cross-feature derived logic lives in domain/business modules instead of UI selectors whenever the logic is reusable or meaningful.

Representative areas:
- `modules/analytics`
- `modules/nutrition`
- `modules/export`
- `modules/privacy`

Responsibilities:
- summaries
- streaks
- calorie estimation
- backup/export formats
- privacy and secure-delete behavior

## Core workflow: manual logging

1. User opens Today or Log flow
2. Workout form produces `WorkoutDraft`
3. Workout service validates and maps draft to `WorkoutEntry`
4. Repository persists workout
5. Summary data is rebuilt or derived
6. UI refreshes via store/actions/selectors

## Core workflow: treadmill scan

1. User opens Scan feature
2. Camera preview guides treadmill display alignment
3. Single capture produces photo source
4. OCR adapter returns normalized text
5. Treadmill parser extracts metrics and confidence
6. User reviews and edits parsed fields
7. Save service maps reviewed values into a workout draft
8. Workout is persisted and scan session metadata is optionally stored

## Persistence model

Tempo uses:
- SQLite for structured records
- local filesystem for images, debug artifacts, and export bundles
- AsyncStorage for lightweight flags and preferences

This split exists because not every storage problem should be forced into a table just because someone discovered SQL in college.

## Data governance model

Tempo assumes:
- user workout and scan data are sensitive
- local persistence is the default
- export is explicit
- deletion flows must be deliberate
- permission use should be minimal and auditable

## Testing strategy

Core tests prioritize:
- treadmill OCR parsing
- parser validators
- workout aggregation
- scan pipeline orchestration
- repository behavior

The test suite intentionally focuses on deterministic business logic before UI snapshot vanity.

## Extension points

Future expansion paths:
- real OCR provider swap-in
- realtime scan assist
- restore from backup bundle
- richer nutrition logic
- heavier analytics and trend decomposition

## Non-goals for v1

- cloud sync
- online accounts
- server-required features
- opaque model-only parsing without explainable rules