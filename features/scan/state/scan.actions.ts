import type { PhotoFile } from 'react-native-vision-camera';

import { validateEditableScanFields } from '@/features/scan/domain/scan.schema';
import { mapScanFieldsToWorkoutDraft } from '@/features/scan/services/scan.mapping.service';
import { saveScanAsWorkout } from '@/features/scan/services/scan.save.service';
import {
  applyPipelineResultToSession,
  persistScanSession,
  runSingleCaptureScan,
} from '@/features/scan/services/scan.session.service';
import { scanStore } from '@/features/scan/state/scan.store';
export const scanActions = Object.freeze({
  beginSession(): void {
    scanStore.beginSession();
  },

  updateField<K extends keyof ReturnType<typeof scanStore.getState>['currentSession']['editableFields']>(
    field: K,
    value: ReturnType<typeof scanStore.getState>['currentSession']['editableFields'][K],
  ): void {
    scanStore.updateFields({ [field]: value });
  },

  updateNotes(notes: string | null): void {
    scanStore.setNotes(notes);
  },

  async runSingleCapture(photo: PhotoFile): Promise<boolean> {
    scanStore.setStatus('processing');
    scanStore.setError(null);

    const session = scanStore.getState().currentSession;
    const result = await runSingleCaptureScan(photo);
    const nextSession = applyPipelineResultToSession(session, result);

    scanStore.setPipelineResult(nextSession);
    await persistScanSession(nextSession);

    return result.ok;
  },

  async saveReviewedScan(): Promise<{ ok: true; workoutId: string } | { ok: false; error: string }> {
    const state = scanStore.getState();
    const session = state.currentSession;

    const validation = validateEditableScanFields(session.editableFields);

    if (!validation.ok) {
      const error = validation.issues[0]?.message ?? 'Scan review validation failed.';
      scanStore.setError(error);
      return { ok: false, error };
    }

    scanStore.setStatus('saving');

    const mapping = mapScanFieldsToWorkoutDraft(
      session.editableFields,
      session.notes,
    );

        const result = await saveScanAsWorkout(mapping.draft, {
      scanSessionId: session.id,
      confidence:
        session.pipelineResult && session.pipelineResult.ok
          ? session.pipelineResult.parsed.confidence
          : null,
      rawText:
        session.pipelineResult && session.pipelineResult.ok
          ? session.pipelineResult.parsed.normalizedText
          : null,
      normalizedText:
        session.pipelineResult && session.pipelineResult.ok
          ? session.pipelineResult.parsed.normalizedText
          : null,
      parsedPayloadJson:
        session.pipelineResult && session.pipelineResult.ok
          ? JSON.stringify(session.pipelineResult.parsed)
          : null,
      debugPayloadJson: session.pipelineResult
        ? JSON.stringify(session.pipelineResult)
        : null,
    });

    if (!result.ok) {
      scanStore.setStatus('error');
      scanStore.setError(result.error);
      return result;
    }

    scanStore.setSavedWorkoutId(result.workoutId);
    scanStore.setStatus('success');
    scanStore.setError(null);

    return result;
  },
});