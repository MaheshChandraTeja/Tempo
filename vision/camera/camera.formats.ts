import { useMemo } from 'react';
import type {
    CameraDevice,
    CameraDeviceFormat,
} from 'react-native-vision-camera';

export type CameraFormatProfile =
  | 'scan-fast'
  | 'scan-balanced'
  | 'scan-detail';

export type CameraFormatSelection = Readonly<{
  format: CameraDeviceFormat | null;
  profile: CameraFormatProfile;
  reason: string;
}>;

function getPhotoResolutionScore(format: CameraDeviceFormat): number {
  return format.photoWidth * format.photoHeight;
}

function getVideoResolutionScore(format: CameraDeviceFormat): number {
  return format.videoWidth * format.videoHeight;
}

function getMaxFps(format: CameraDeviceFormat): number {
  return Math.max(...format.frameRateRanges.map(range => range.maxFrameRate), 0);
}

function getMinFps(format: CameraDeviceFormat): number {
  return Math.min(...format.frameRateRanges.map(range => range.minFrameRate), 0);
}

function supportsThirtyFps(format: CameraDeviceFormat): boolean {
  return format.frameRateRanges.some(
    range => range.minFrameRate <= 30 && range.maxFrameRate >= 30,
  );
}

function compareBalanced(left: CameraDeviceFormat, right: CameraDeviceFormat): number {
  const leftThirty = supportsThirtyFps(left) ? 1 : 0;
  const rightThirty = supportsThirtyFps(right) ? 1 : 0;

  if (leftThirty !== rightThirty) {
    return rightThirty - leftThirty;
  }

  const leftPhoto = getPhotoResolutionScore(left);
  const rightPhoto = getPhotoResolutionScore(right);

  if (leftPhoto !== rightPhoto) {
    return rightPhoto - leftPhoto;
  }

  return getMaxFps(right) - getMaxFps(left);
}

function compareFast(left: CameraDeviceFormat, right: CameraDeviceFormat): number {
  const leftThirty = supportsThirtyFps(left) ? 1 : 0;
  const rightThirty = supportsThirtyFps(right) ? 1 : 0;

  if (leftThirty !== rightThirty) {
    return rightThirty - leftThirty;
  }

  const leftFps = getMaxFps(left);
  const rightFps = getMaxFps(right);

  if (leftFps !== rightFps) {
    return rightFps - leftFps;
  }

  return getVideoResolutionScore(right) - getVideoResolutionScore(left);
}

function compareDetail(left: CameraDeviceFormat, right: CameraDeviceFormat): number {
  const leftPhoto = getPhotoResolutionScore(left);
  const rightPhoto = getPhotoResolutionScore(right);

  if (leftPhoto !== rightPhoto) {
    return rightPhoto - leftPhoto;
  }

  const leftThirty = supportsThirtyFps(left) ? 1 : 0;
  const rightThirty = supportsThirtyFps(right) ? 1 : 0;

  if (leftThirty !== rightThirty) {
    return rightThirty - leftThirty;
  }

  return getMaxFps(right) - getMaxFps(left);
}

export function selectCameraFormat(
  device: CameraDevice | null,
  profile: CameraFormatProfile = 'scan-balanced',
): CameraFormatSelection {
  if (!device || device.formats.length === 0) {
    return {
      format: null,
      profile,
      reason: 'No compatible camera format is available.',
    };
  }

  const formats = [...device.formats];

  const sorted = formats.sort((left, right) => {
    switch (profile) {
      case 'scan-fast':
        return compareFast(left, right);
      case 'scan-detail':
        return compareDetail(left, right);
      case 'scan-balanced':
      default:
        return compareBalanced(left, right);
    }
  });

  return {
    format: sorted[0] ?? null,
    profile,
    reason:
      profile === 'scan-fast'
        ? 'Prioritizes startup/capture speed and stable FPS.'
        : profile === 'scan-detail'
        ? 'Prioritizes still-photo detail and photo resolution.'
        : 'Balances readable photo detail with stable capture behavior.',
  };
}

export function useCameraFormatSelection(
  device: CameraDevice | null,
  profile: CameraFormatProfile = 'scan-balanced',
): CameraFormatSelection {
  return useMemo(() => selectCameraFormat(device, profile), [device, profile]);
}

export function describeCameraFormat(
  format: CameraDeviceFormat | null,
): string {
  if (!format) {
    return 'No format selected';
  }

  const fpsMin = getMinFps(format);
  const fpsMax = getMaxFps(format);

  return [
    `photo ${format.photoWidth}x${format.photoHeight}`,
    `video ${format.videoWidth}x${format.videoHeight}`,
    `fps ${fpsMin}-${fpsMax}`,
  ].join(' • ');
}