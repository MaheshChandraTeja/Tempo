import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  VisionCamera,
  type PermissionStatus as NativeCameraPermissionStatus,
} from 'react-native-vision-camera';

export type CameraPermissionStatus =
  | 'unknown'
  | 'granted'
  | 'denied'
  | 'blocked'
  | 'unavailable';

export type CameraPermissionState = Readonly<{
  status: CameraPermissionStatus;
  isGranted: boolean;
  isDenied: boolean;
  isNotDetermined: boolean;
  canAskAgain: boolean;
}>;

export type CameraPermissionResult = Readonly<{
  state: CameraPermissionState;
  refresh: () => Promise<CameraPermissionState>;
  request: () => Promise<CameraPermissionState>;
}>;

function toPermissionState(
  nativeStatus: NativeCameraPermissionStatus,
): CameraPermissionState {
  const isGranted = nativeStatus === 'authorized';
  const isNotDetermined = nativeStatus === 'not-determined';
  const isBlocked = nativeStatus === 'restricted';

  return {
    status: isGranted
      ? 'granted'
      : isBlocked
      ? 'blocked'
      : isNotDetermined
      ? 'unknown'
      : 'denied',
    isGranted,
    isDenied: nativeStatus === 'denied' || isBlocked,
    isNotDetermined,
    canAskAgain: isNotDetermined,
  };
}

export async function getCameraPermissionState(): Promise<CameraPermissionState> {
  const status = VisionCamera.cameraPermissionStatus;
  return toPermissionState(status);
}

export async function requestCameraPermissionState(): Promise<CameraPermissionState> {
  await VisionCamera.requestCameraPermission();
  return getCameraPermissionState();
}

export function useCameraPermissionState(): CameraPermissionResult {
  const [state, setState] = useState<CameraPermissionState>({
    status: 'unknown',
    isGranted: false,
    isDenied: false,
    isNotDetermined: true,
    canAskAgain: true,
  });

  const refresh = useCallback(async () => {
    const next = await getCameraPermissionState();
    setState(next);
    return next;
  }, []);

  const request = useCallback(async () => {
    const next = await requestCameraPermissionState();
    setState(next);
    return next;
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return useMemo(
    () => ({
      state,
      refresh,
      request,
    }),
    [refresh, request, state],
  );
}
