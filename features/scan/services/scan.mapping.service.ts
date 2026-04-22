import type {
    EditableScanFields,
    ScanMappingResult,
} from '@/features/scan/domain/scan.types';
import type { WorkoutDraft } from '@/features/workout-log/domain/workout.types';
import type { ScanPipelineResult } from '@/vision/pipeline/scan.pipeline';

function getDurationSecondsFromPipeline(result: ScanPipelineResult): number | null {
  if (!result.ok) {
    return null;
  }

  return result.parsed.metrics.time.value?.totalSeconds ?? null;
}

export function getEditableFieldsFromPipeline(
  result: ScanPipelineResult | null,
): EditableScanFields {
  if (!result || !result.ok) {
    return {
      durationSeconds: null,
      distanceKm: null,
      caloriesKcal: null,
      speedKph: null,
      inclinePercent: null,
    };
  }

  return {
    durationSeconds: getDurationSecondsFromPipeline(result),
    distanceKm: result.parsed.metrics.distanceKm.value,
    caloriesKcal: result.parsed.metrics.caloriesKcal.value,
    speedKph: result.parsed.metrics.speedKph.value,
    inclinePercent: result.parsed.metrics.inclinePercent.value,
  };
}

export function mapScanFieldsToWorkoutDraft(
  fields: EditableScanFields,
  notes: string | null = null,
): ScanMappingResult {
  const draft: WorkoutDraft = {
    kind: 'treadmill',
    source: 'treadmill-scan',
    durationSeconds: fields.durationSeconds,
    distanceKm: fields.distanceKm,
    caloriesKcal: fields.caloriesKcal,
    speedKph: fields.speedKph,
    inclinePercent: fields.inclinePercent,
    notes,
    title: 'Treadmill Scan',
  };

  return {
    draft,
    fields,
  };
}