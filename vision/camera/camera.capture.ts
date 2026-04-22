import type { RefObject } from 'react';
import {
    Camera,
    type PhotoFile,
    type TakePhotoOptions,
} from 'react-native-vision-camera';

export type CaptureStillPhotoOptions = Readonly<{
  flash?: 'off' | 'on' | 'auto';
  enableAutoDistortionCorrection?: boolean;
  enableAutoRedEyeReduction?: boolean;
  enableShutterSound?: boolean;
}>;

export type CaptureStillPhotoResult =
  | Readonly<{
      ok: true;
      photo: PhotoFile;
    }>
  | Readonly<{
      ok: false;
      error: string;
    }>;

function normalizeCaptureError(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return 'Failed to capture still photo.';
}

export function toTakePhotoOptions(
  options: CaptureStillPhotoOptions = {},
): TakePhotoOptions {
  return {
    flash: options.flash ?? 'off',
    enableAutoDistortionCorrection:
      options.enableAutoDistortionCorrection ?? true,
    enableAutoRedEyeReduction:
      options.enableAutoRedEyeReduction ?? false,
    enableShutterSound: options.enableShutterSound ?? false,
  };
}

export function isCameraReady(
  cameraRef: RefObject<Camera | null | undefined>,
): boolean {
  return cameraRef.current != null;
}

export async function captureStillPhoto(
  cameraRef: RefObject<Camera | null | undefined>,
  options: CaptureStillPhotoOptions = {},
): Promise<CaptureStillPhotoResult> {
  try {
    const camera = cameraRef.current;

    if (!camera) {
      return {
        ok: false,
        error: 'Camera is not ready.',
      };
    }

    const photo = await camera.takePhoto(toTakePhotoOptions(options));

    return {
      ok: true,
      photo,
    };
  } catch (error) {
    return {
      ok: false,
      error: normalizeCaptureError(error),
    };
  }
}