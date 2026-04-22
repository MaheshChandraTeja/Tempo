import { getCameraPermissionState } from '@/vision/camera/camera.permissions';

export type AuditedPermissionName = 'camera';

export type PermissionAuditRecord = Readonly<{
  permission: AuditedPermissionName;
  status: 'granted' | 'denied' | 'blocked' | 'unavailable' | 'unknown';
  requiredFor: string;
  granted: boolean;
  auditedAt: string;
}>;

export type PermissionAuditSummary = Readonly<{
  auditedAt: string;
  records: PermissionAuditRecord[];
  allRequiredPermissionsGranted: boolean;
}>;

function mapCameraStatusToAuditStatus(
  status: Awaited<ReturnType<typeof getCameraPermissionState>>['status'],
): PermissionAuditRecord['status'] {
  switch (status) {
    case 'granted':
      return 'granted';
    case 'denied':
      return 'denied';
    case 'blocked':
      return 'blocked';
    case 'unavailable':
      return 'unavailable';
    case 'unknown':
    default:
      return 'unknown';
  }
}

export async function auditPermissions(): Promise<PermissionAuditSummary> {
  const auditedAt = new Date().toISOString();

  const camera = await getCameraPermissionState();

  const records: PermissionAuditRecord[] = [
    {
      permission: 'camera',
      status: mapCameraStatusToAuditStatus(camera.status),
      requiredFor: 'Treadmill display scanning',
      granted: camera.isGranted,
      auditedAt,
    },
  ];

  return {
    auditedAt,
    records,
    allRequiredPermissionsGranted: records.every(record => record.granted),
  };
}

export function summarizePermissionAudit(
  audit: PermissionAuditSummary,
): string {
  const cameraRecord = audit.records.find(record => record.permission === 'camera');

  if (!cameraRecord) {
    return 'No permission records were audited.';
  }

  return `Camera permission is ${cameraRecord.status}. Required for treadmill display scanning.`;
}