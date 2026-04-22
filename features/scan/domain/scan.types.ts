import type { WorkoutDraft } from '@/features/workout-log/domain/workout.types';
import type { ScanPipelineResult } from '@/vision/pipeline/scan.pipeline';
import type { TreadmillFieldKey } from '@/vision/treadmill/treadmill.fields';

export type ScanFieldId =
  | 'time'
  | 'distanceKm'
  | 'caloriesKcal'
  | 'speedKph'
  | 'inclinePercent';

export type EditableScanFields = Readonly<{
  durationSeconds: number | null;
  distanceKm: number | null;
  caloriesKcal: number | null;
  speedKph: number | null;
  inclinePercent: number | null;
}>;

export type ScanSessionStatus =
  | 'idle'
  | 'preparing'
  | 'capturing'
  | 'processing'
  | 'reviewing'
  | 'saving'
  | 'success'
  | 'error';

export type ScanFieldViewModel = Readonly<{
  id: ScanFieldId;
  label: string;
  valueText: string;
  confidence: number;
  sourceKey: TreadmillFieldKey | null;
  editable: boolean;
  warningText: string | null;
}>;

export type ScanSession = Readonly<{
  id: string;
  createdAt: string;
  updatedAt: string;
  status: ScanSessionStatus;
  pipelineResult: ScanPipelineResult | null;
  editableFields: EditableScanFields;
  notes: string | null;
  error: string | null;
  savedWorkoutId: string | null;
}>;

export type ScanSavePayload = Readonly<{
  workoutDraft: WorkoutDraft;
  sessionId: string;
}>;

export type ScanMappingResult = Readonly<{
  draft: WorkoutDraft;
  fields: EditableScanFields;
}>;

export type ScanValidationIssue = Readonly<{
  field: keyof EditableScanFields | 'notes' | 'session';
  message: string;
}>;

export type ScanValidationResult =
  | Readonly<{
      ok: true;
      issues: [];
    }>
  | Readonly<{
      ok: false;
      issues: ScanValidationIssue[];
    }>;