import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Camera,
    type CameraPermissionStatus,
} from 'react-native-vision-camera';

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
  status: CameraPermissionStatus,
): CameraPermissionState {
  return {
    status,
    isGranted: status === 'granted',
    isDenied: status === 'denied' || status === 'restricted',
    isNotDetermined: status === 'not-determined',
    canAskAgain: status === 'not-determined',
  };
}

export async function getCameraPermissionState(): Promise<CameraPermissionState> {
  const status = await Camera.getCameraPermissionStatus();
  return toPermissionState(status);
}

export async function requestCameraPermissionState(): Promise<CameraPermissionState> {
  const status = await Camera.requestCameraPermission();
  return toPermissionState(status);
}

export function useCameraPermissionState(): CameraPermissionResult {
  const [state, setState] = useState<CameraPermissionState>({
    status: 'not-determined',
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