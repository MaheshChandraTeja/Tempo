import { useMemo } from 'react';
import type {
  CameraDevice,
  Range,
  Size,
} from 'react-native-vision-camera';

export type CameraFormatProfile =
  | 'scan-fast'
  | 'scan-balanced'
  | 'scan-detail';

export type CameraFormatDescriptor = Readonly<{
  photoResolution: Size | null;
  videoResolution: Size | null;
  fpsRange: Range | null;
}>;

export type CameraFormatSelection = Readonly<{
  format: CameraFormatDescriptor | null;
  profile: CameraFormatProfile;
  reason: string;
}>;

function getResolutionScore(resolution: Size | null): number {
  if (!resolution) {
    return 0;
  }

  return resolution.width * resolution.height;
}

function getMaxFps(range: Range | null): number {
  return range?.max ?? 0;
}

function getMinFps(range: Range | null): number {
  return range?.min ?? 0;
}

function supportsThirtyFps(range: Range | null): boolean {
  if (!range) {
    return false;
  }

  return range.min <= 30 && range.max >= 30;
}

function pickLargestResolution(resolutions: readonly Size[]): Size | null {
  return resolutions.reduce<Size | null>((best, candidate) => {
    if (!best) {
      return candidate;
    }

    return getResolutionScore(candidate) > getResolutionScore(best)
      ? candidate
      : best;
  }, null);
}

function pickSmallestResolution(resolutions: readonly Size[]): Size | null {
  return resolutions.reduce<Size | null>((best, candidate) => {
    if (!best) {
      return candidate;
    }

    return getResolutionScore(candidate) < getResolutionScore(best)
      ? candidate
      : best;
  }, null);
}

function compareBalancedRanges(left: Range, right: Range): number {
  const leftThirty = supportsThirtyFps(left) ? 1 : 0;
  const rightThirty = supportsThirtyFps(right) ? 1 : 0;

  if (leftThirty !== rightThirty) {
    return rightThirty - leftThirty;
  }

  if (left.max !== right.max) {
    return right.max - left.max;
  }

  return right.min - left.min;
}

function compareFastRanges(left: Range, right: Range): number {
  if (left.max !== right.max) {
    return right.max - left.max;
  }

  const leftThirty = supportsThirtyFps(left) ? 1 : 0;
  const rightThirty = supportsThirtyFps(right) ? 1 : 0;

  if (leftThirty !== rightThirty) {
    return rightThirty - leftThirty;
  }

  return right.min - left.min;
}

function compareDetailRanges(left: Range, right: Range): number {
  const leftThirty = supportsThirtyFps(left) ? 1 : 0;
  const rightThirty = supportsThirtyFps(right) ? 1 : 0;

  if (leftThirty !== rightThirty) {
    return rightThirty - leftThirty;
  }

  if (left.min !== right.min) {
    return left.min - right.min;
  }

  return right.max - left.max;
}

function pickFpsRange(
  ranges: readonly Range[],
  profile: CameraFormatProfile,
): Range | null {
  if (ranges.length === 0) {
    return null;
  }

  const sorted = [...ranges].sort((left, right) => {
    switch (profile) {
      case 'scan-fast':
        return compareFastRanges(left, right);
      case 'scan-detail':
        return compareDetailRanges(left, right);
      case 'scan-balanced':
      default:
        return compareBalancedRanges(left, right);
    }
  });

  return sorted[0] ?? null;
}

function selectPhotoResolution(
  resolutions: readonly Size[],
  profile: CameraFormatProfile,
): Size | null {
  switch (profile) {
    case 'scan-fast':
      return pickSmallestResolution(resolutions);
    case 'scan-detail':
    case 'scan-balanced':
    default:
      return pickLargestResolution(resolutions);
  }
}

function selectVideoResolution(
  resolutions: readonly Size[],
  profile: CameraFormatProfile,
): Size | null {
  switch (profile) {
    case 'scan-fast':
      return pickSmallestResolution(resolutions);
    case 'scan-detail':
    case 'scan-balanced':
    default:
      return pickLargestResolution(resolutions);
  }
}

export function selectCameraFormat(
  device: CameraDevice | null,
  profile: CameraFormatProfile = 'scan-balanced',
): CameraFormatSelection {
  if (!device) {
    return {
      format: null,
      profile,
      reason: 'No compatible camera device is available.',
    };
  }

  const photoResolutions = device.getSupportedResolutions('photo');
  const videoResolutions = device.getSupportedResolutions('video');
  const fpsRange = pickFpsRange(device.supportedFPSRanges, profile);
  const photoResolution = selectPhotoResolution(photoResolutions, profile);
  const videoResolution = selectVideoResolution(videoResolutions, profile);

  if (!photoResolution && !videoResolution && !fpsRange) {
    return {
      format: null,
      profile,
      reason: 'No compatible camera capabilities are available.',
    };
  }

  return {
    format: {
      photoResolution,
      videoResolution,
      fpsRange,
    },
    profile,
    reason:
      profile === 'scan-fast'
        ? 'Derived from device capabilities with smaller resolutions and the fastest available FPS range.'
        : profile === 'scan-detail'
        ? 'Derived from device capabilities with the largest available capture resolutions.'
        : 'Derived from device capabilities to balance readable detail with stable 30 FPS capture when available.',
  };
}

export function useCameraFormatSelection(
  device: CameraDevice | null,
  profile: CameraFormatProfile = 'scan-balanced',
): CameraFormatSelection {
  return useMemo(() => selectCameraFormat(device, profile), [device, profile]);
}

export function describeCameraFormat(
  format: CameraFormatDescriptor | null,
): string {
  if (!format) {
    return 'No format selected';
  }

  const fpsMin = getMinFps(format.fpsRange);
  const fpsMax = getMaxFps(format.fpsRange);

  const parts = [
    format.photoResolution
      ? `photo ${format.photoResolution.width}x${format.photoResolution.height}`
      : null,
    format.videoResolution
      ? `video ${format.videoResolution.width}x${format.videoResolution.height}`
      : null,
    format.fpsRange ? `fps ${fpsMin}-${fpsMax}` : null,
  ].filter((part): part is string => part != null);

  return parts.length > 0 ? parts.join(' | ') : 'No format selected';
}
