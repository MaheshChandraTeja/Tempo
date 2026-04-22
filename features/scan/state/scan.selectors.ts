import type { ScanFieldViewModel, ScanState } from '@/features/scan/domain/scan.types';

export function selectCurrentScanSession(state: ScanState) {
  return state.currentSession;
}

export function selectScanDebugEnabled(state: ScanState): boolean {
  return state.debugModeEnabled;
}

export function selectScanCanReview(state: ScanState): boolean {
  return state.currentSession.status === 'reviewing' && !!state.currentSession.pipelineResult?.ok;
}

export function selectScanFieldCards(state: ScanState): ScanFieldViewModel[] {
  const session = state.currentSession;
  const pipeline = session.pipelineResult;

  const parsed = pipeline && pipeline.ok ? pipeline.parsed : null;

  return [
    {
      id: 'time',
      label: 'Time',
      valueText:
        session.editableFields.durationSeconds != null
          ? `${Math.floor(session.editableFields.durationSeconds / 60)}m ${session.editableFields.durationSeconds % 60}s`
          : '—',
      confidence: parsed?.metrics.time.confidence ?? 0,
      sourceKey: 'time',
      editable: true,
      warningText: parsed?.metrics.time.warnings[0] ?? null,
    },
    {
      id: 'distanceKm',
      label: 'Distance',
      valueText:
        session.editableFields.distanceKm != null
          ? `${session.editableFields.distanceKm} km`
          : '—',
      confidence: parsed?.metrics.distanceKm.confidence ?? 0,
      sourceKey: 'distance',
      editable: true,
      warningText: parsed?.metrics.distanceKm.warnings[0] ?? null,
    },
    {
      id: 'caloriesKcal',
      label: 'Calories',
      valueText:
        session.editableFields.caloriesKcal != null
          ? `${session.editableFields.caloriesKcal} kcal`
          : '—',
      confidence: parsed?.metrics.caloriesKcal.confidence ?? 0,
      sourceKey: 'calories',
      editable: true,
      warningText: parsed?.metrics.caloriesKcal.warnings[0] ?? null,
    },
    {
      id: 'speedKph',
      label: 'Speed',
      valueText:
        session.editableFields.speedKph != null
          ? `${session.editableFields.speedKph} kph`
          : '—',
      confidence: parsed?.metrics.speedKph.confidence ?? 0,
      sourceKey: 'speed',
      editable: true,
      warningText: parsed?.metrics.speedKph.warnings[0] ?? null,
    },
    {
      id: 'inclinePercent',
      label: 'Incline',
      valueText:
        session.editableFields.inclinePercent != null
          ? `${session.editableFields.inclinePercent}%`
          : '—',
      confidence: parsed?.metrics.inclinePercent.confidence ?? 0,
      sourceKey: 'incline',
      editable: true,
      warningText: parsed?.metrics.inclinePercent.warnings[0] ?? null,
    },
  ];
}