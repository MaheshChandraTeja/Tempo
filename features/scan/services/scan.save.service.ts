import type { WorkoutDraft } from '@/features/workout-log/domain/workout.types';
import { workoutActions } from '@/features/workout-log/state/workout.runtime';
import { getScansRepository } from '@/storage/db/repositories/scans.repository';

export type ScanSaveResult =
  | Readonly<{
      ok: true;
      workoutId: string;
    }>
  | Readonly<{
      ok: false;
      error: string;
    }>;

export async function saveScanAsWorkout(
  draft: WorkoutDraft,
  options?: Readonly<{
    scanSessionId?: string;
    confidence?: number | null;
    rawText?: string | null;
    normalizedText?: string | null;
    parsedPayloadJson?: string | null;
    debugPayloadJson?: string | null;
  }>,
): Promise<ScanSaveResult> {
  const entry = await workoutActions.addWorkout(draft);

  if (!entry) {
    return {
      ok: false,
      error: 'Failed to save scanned workout.',
    };
  }

  if (options?.scanSessionId) {
    const scansRepository = getScansRepository();
    const existing = await scansRepository.getById(options.scanSessionId);

    if (existing) {
      await scansRepository.upsert({
        ...existing,
        updatedAt: new Date().toISOString(),
        confidence: options.confidence ?? existing.confidence,
        rawText: options.rawText ?? existing.rawText,
        normalizedText: options.normalizedText ?? existing.normalizedText,
        parsedPayloadJson: options.parsedPayloadJson ?? existing.parsedPayloadJson,
        debugPayloadJson: options.debugPayloadJson ?? existing.debugPayloadJson,
        savedWorkoutId: entry.id,
      });
    }
  }

  return {
    ok: true,
    workoutId: entry.id,
  };
}