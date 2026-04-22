# Storage Schema

## Purpose

Tempo persists local data across structured tables, file storage, and key-value storage.

## SQLite tables

### `workouts`

Purpose:
- canonical workout records

Key fields:
- `id`
- `date`
- `logged_at`
- `kind`
- `source`
- `intensity`
- `duration_seconds`
- `calories_kcal`
- `distance_km`
- `speed_kph`
- `incline_percent`
- `title`
- `notes`
- `is_estimated_calories`
- `source_confidence`
- `created_at`
- `updated_at`

Indexes:
- date
- logged_at
- source

### `daily_summaries`

Purpose:
- derived day-level totals for dashboard/history acceleration

Key fields:
- `date`
- `total_workouts`
- `total_calories_kcal`
- `total_duration_seconds`
- `total_distance_km`
- `created_at`
- `updated_at`

### `scan_sessions`

Purpose:
- scan metadata and review/debug persistence

Key fields:
- `id`
- `created_at`
- `updated_at`
- `status`
- `raw_text`
- `normalized_text`
- `parsed_payload_json`
- `debug_payload_json`
- `image_path`
- `warning_count`
- `confidence`
- `saved_workout_id`

### `app_settings`

Purpose:
- durable app-level settings stored in SQLite

Key fields:
- `setting_key`
- `setting_value`
- `updated_at`

## Migrations

Current migration flow:
1. `001_init`
2. `002_add_scan_session`
3. `003_add_confidence_fields`

Rules:
- migrations must be explicit
- migrations must be deterministic
- migration side effects should be minimal
- destructive migrations require deliberate handling

## File storage

Used for:
- cached scan images
- debug artifacts
- exported bundles

Representative areas:
- `storage/files/imageCache.ts`
- `storage/files/debugArtifacts.ts`
- `storage/files/exportJson.ts`

## Key-value storage

Used for:
- lightweight preferences
- runtime flags

Representative areas:
- `storage/kv/preferences.ts`
- `storage/kv/runtimeFlags.ts`

## Repository pattern

Repositories isolate DB concerns from features.

Representative repositories:
- workouts
- summaries
- scans
- settings

Screens and selectors should not issue SQL directly. That way lies rot and copy-paste misery.

## Seed data

Demo data can be imported through:
- `storage/db/seed/demoWorkouts.ts`
- `scripts/import-sample-data.ts`

## Export model

Backup/export data can include:
- workouts
- summaries
- scans
- manifest metadata

Formats:
- JSON
- CSV
- bundled backup directory