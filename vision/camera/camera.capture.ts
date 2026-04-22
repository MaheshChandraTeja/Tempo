import type { RefObject } from 'react';
import type {
  CameraPhotoOutput,
  CameraRef,
  CapturePhotoSettings,
  PhotoFile,
} from 'react-native-vision-camera';

export type CaptureStillPhotoOptions = Readonly<{
  flash?: 'off' | 'on' | 'auto';
  enableAutoDistortionCorrection?: boolean;
  enableAutoRedEyeReduction?: boolean;
  enableShutterSound?: boolean;
}>;

export type CaptureStillPhotoTarget = Readonly<{
  cameraRef: RefObject<CameraRef | null | undefined>;
  photoOutput: CameraPhotoOutput;
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

export function toCapturePhotoSettings(
  options: CaptureStillPhotoOptions = {},
): CapturePhotoSettings {
  return {
    flashMode: options.flash ?? 'off',
    enableDistortionCorrection:
      options.enableAutoDistortionCorrection ?? true,
    enableRedEyeReduction:
      options.enableAutoRedEyeReduction ?? false,
    enableShutterSound: options.enableShutterSound ?? false,
  };
}

export function isCameraReady(
  target: CaptureStillPhotoTarget,
): boolean {
  return target.cameraRef.current?.controller != null;
}

export async function captureStillPhoto(
  target: CaptureStillPhotoTarget,
  options: CaptureStillPhotoOptions = {},
): Promise<CaptureStillPhotoResult> {
  try {
    const camera = target.cameraRef.current;

    if (!camera?.controller) {
      return {
        ok: false,
        error: 'Camera is not ready.',
      };
    }

    const photo = await target.photoOutput.capturePhotoToFile(
      toCapturePhotoSettings(options),
      {},
    );

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
