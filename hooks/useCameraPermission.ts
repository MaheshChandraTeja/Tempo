import { useCallback, useMemo } from 'react';

import { usePermissions } from '@/providers/PermissionsProvider';
import type { CameraPermissionState, PermissionStatus } from '@/types/common';

type UseCameraPermissionResult = Readonly<{
  permission: CameraPermissionState;
  refresh: () => Promise<PermissionStatus>;
  request: () => Promise<PermissionStatus>;
}>;

function mapCameraPermission(status: PermissionStatus): CameraPermissionState {
  return {
    status,
    canAskAgain: status !== 'blocked' && status !== 'unavailable',
    isGranted: status === 'granted',
    isDenied: status === 'denied',
    isBlocked: status === 'blocked',
    isUnavailable: status === 'unavailable',
  };
}

export function useCameraPermission(): UseCameraPermissionResult {
  const { permissions, refreshPermission, requestPermission } = usePermissions();

  const currentStatus = permissions.camera;

  const refresh = useCallback(async () => {
    return refreshPermission('camera');
  }, [refreshPermission]);

  const request = useCallback(async () => {
    return requestPermission('camera');
  }, [requestPermission]);

  const permission = useMemo(
    () => mapCameraPermission(currentStatus),
    [currentStatus],
  );

  return {
    permission,
    refresh,
    request,
  };
}