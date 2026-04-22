import type { PhotoFile } from 'react-native-vision-camera';

import { SCAN_DEFAULTS } from '@/features/scan/domain/scan.constants';
import type { EditableScanFields, ScanSession } from '@/features/scan/domain/scan.types';
import { getEditableFieldsFromPipeline } from '@/features/scan/services/scan.mapping.service';
import { getScansRepository } from '@/storage/db/repositories/scans.repository';
import { createMockOcrAdapter } from '@/vision/ocr/ocr.adapter';
import { createScanPipeline, type ScanPipelineResult } from '@/vision/pipeline/scan.pipeline';
import { createSingleCapturePipeline } from '@/vision/pipeline/singleCapture.pipeline';

function createSessionId(): string {
  return `scan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const demoOcrText = `
TIME 12:30
DIST 1.50
CAL 145
SPEED 7.20
INCL 2.0
`;

const sharedPipeline = createScanPipeline({
  ocrAdapter: createMockOcrAdapter(demoOcrText),
});

const singleCapturePipeline = createSingleCapturePipeline(sharedPipeline);

export function createEmptyScanSession(): ScanSession {
  const now = new Date().toISOString();

  return {
    id: createSessionId(),
    createdAt: now,
    updatedAt: now,
    status: 'idle',
    pipelineResult: null,
    editableFields: {
      durationSeconds: null,
      distanceKm: null,
      caloriesKcal: null,
      speedKph: null,
      inclinePercent: null,
    },
    notes: null,
    error: null,
    savedWorkoutId: null,
  };
}

export function updateSessionFields(
  session: ScanSession,
  fields: Partial<EditableScanFields>,
): ScanSession {
  return {
    ...session,
    updatedAt: new Date().toISOString(),
    editableFields: {
      ...session.editableFields,
      ...fields,
    },
  };
}

export async function persistScanSession(session: ScanSession): Promise<void> {
  const scansRepository = getScansRepository();
  const pipeline = session.pipelineResult;
  const parsed = pipeline && pipeline.ok ? pipeline.parsed : null;

  await scansRepository.upsert({
    id: session.id,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    status: session.status,
    rawText: pipeline && pipeline.ok ? pipeline.parsed.normalizedText : null,
    normalizedText: pipeline && pipeline.ok ? pipeline.parsed.normalizedText : null,
    parsedPayloadJson: parsed ? JSON.stringify(parsed) : null,
    debugPayloadJson: pipeline ? JSON.stringify(pipeline) : null,
    imagePath: null,
    warningCount: parsed?.warnings.length ?? 0,
    confidence: parsed?.confidence ?? null,
    savedWorkoutId: session.savedWorkoutId,
  });
}

export async function runSingleCaptureScan(
  photo: PhotoFile,
): Promise<ScanPipelineResult> {
  return singleCapturePipeline.run({
    kind: 'photo-file',
    photo,
    captureDebugLabel: SCAN_DEFAULTS.captureDebugLabel,
  });
}

export function applyPipelineResultToSession(
  session: ScanSession,
  result: ScanPipelineResult,
): ScanSession {
  return {
    ...session,
    updatedAt: new Date().toISOString(),
    status: result.ok ? 'reviewing' : 'error',
    pipelineResult: result,
    editableFields: result.ok
      ? getEditableFieldsFromPipeline(result)
      : session.editableFields,
    error: result.ok ? null : result.error,
  };
}