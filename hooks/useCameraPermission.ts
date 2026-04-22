import { useCallback, useMemo } from 'react';

import type { CameraPermissionState, PermissionStatus } from '@/types/common';
import { useCameraPermissionState } from '@/vision/camera/camera.permissions';

type UseCameraPermissionResult = Readonly<{
  permission: CameraPermissionState;
  refresh: () => Promise<PermissionStatus>;
  request: () => Promise<PermissionStatus>;
}>;

function mapCameraPermission(
  status: ReturnType<typeof useCameraPermissionState>['state'],
): CameraPermissionState {
  return {
    status: status.status,
    canAskAgain: status.canAskAgain,
    isGranted: status.isGranted,
    isDenied: status.isDenied && status.status === 'denied',
    isBlocked: status.status === 'blocked',
    isUnavailable: status.status === 'unavailable',
  };
}

export function useCameraPermission(): UseCameraPermissionResult {
  const { state, refresh: refreshState, request: requestState } =
    useCameraPermissionState();

  const refresh = useCallback(async () => {
    const next = await refreshState();
    return next.status;
  }, [refreshState]);

  const request = useCallback(async () => {
    const next = await requestState();
    return next.status;
  }, [requestState]);

  const permission = useMemo(() => mapCameraPermission(state), [state]);

  return {
    permission,
    refresh,
    request,
  };
}
