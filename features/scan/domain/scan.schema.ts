import type {
    EditableScanFields,
    ScanValidationIssue,
    ScanValidationResult,
} from '@/features/scan/domain/scan.types';

function pushRangeIssue(
  issues: ScanValidationIssue[],
  field: keyof EditableScanFields,
  value: number | null,
  min: number,
  max: number,
): void {
  if (value == null) {
    return;
  }

  if (!Number.isFinite(value) || value < min || value > max) {
    issues.push({
      field,
      message: `${field} must be between ${min} and ${max}.`,
    });
  }
}

export function validateEditableScanFields(
  fields: EditableScanFields,
): ScanValidationResult {
  const issues: ScanValidationIssue[] = [];

  pushRangeIssue(issues, 'durationSeconds', fields.durationSeconds, 0, 24 * 60 * 60);
  pushRangeIssue(issues, 'distanceKm', fields.distanceKm, 0, 100);
  pushRangeIssue(issues, 'caloriesKcal', fields.caloriesKcal, 0, 5000);
  pushRangeIssue(issues, 'speedKph', fields.speedKph, 0, 40);
  pushRangeIssue(issues, 'inclinePercent', fields.inclinePercent, 0, 30);

  if (
    fields.durationSeconds != null &&
    fields.distanceKm != null &&
    fields.speedKph != null &&
    fields.durationSeconds > 0
  ) {
    const derivedSpeed = fields.distanceKm / (fields.durationSeconds / 3600);

    if (Math.abs(derivedSpeed - fields.speedKph) > 6) {
      issues.push({
        field: 'speedKph',
        message: 'Speed looks inconsistent with time and distance.',
      });
    }
  }

  if (issues.length > 0) {
    return {
      ok: false,
      issues,
    };
  }

  return {
    ok: true,
    issues: [],
  };
}