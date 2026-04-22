import { useMemo } from 'react';
import {
    getAllCameraDevices,
    getCameraDevice,
    type CameraDevice,
    type CameraPosition,
} from 'react-native-vision-camera';

export type CameraDevicePreference = Readonly<{
  position?: CameraPosition;
  /**
   * Prefer a simpler physical camera for faster startup.
   * Example values seen in VisionCamera docs include:
   * - 'wide-angle-camera'
   * - 'ultra-wide-angle-camera'
   * - 'telephoto-camera'
   */
  preferredPhysicalDevices?: string[];
  allowExternal?: boolean;
}>;

export type CameraDeviceSummary = Readonly<{
  id: string;
  name: string;
  position: string;
  physicalDeviceCount: number;
  supportsLowLightBoost: boolean;
  supportsFocus: boolean;
  hasFlash: boolean;
  formatCount: number;
}>;

function getFallbackOrder(
  preference: CameraDevicePreference,
): ReadonlyArray<readonly [CameraPosition, string[] | undefined]> {
  const position = preference.position ?? 'back';
  const preferredPhysicalDevices = preference.preferredPhysicalDevices;

  const base: Array<readonly [CameraPosition, string[] | undefined]> = [
    [position, preferredPhysicalDevices],
    [position, ['wide-angle-camera']],
    [position, undefined],
  ];

  if (preference.allowExternal) {
    base.push(['external', undefined]);
  }

  return base;
}

export function selectPreferredCameraDevice(
  devices: readonly CameraDevice[],
  preference: CameraDevicePreference = {},
): CameraDevice | null {
  const fallbackOrder = getFallbackOrder(preference);

  for (const [position, physicalDevices] of fallbackOrder) {
    const device = getCameraDevice(devices, position, {
      physicalDevices,
    });

    if (device) {
      return device;
    }
  }

  return null;
}

export function getPreferredCameraDevice(
  preference: CameraDevicePreference = {},
): CameraDevice | null {
  const devices = getAllCameraDevices();
  return selectPreferredCameraDevice(devices, preference);
}

export function summarizeCameraDevice(
  device: CameraDevice,
): CameraDeviceSummary {
  return {
    id: device.id,
    name: device.name,
    position: device.position,
    physicalDeviceCount: device.physicalDevices.length,
    supportsLowLightBoost: device.supportsLowLightBoost ?? false,
    supportsFocus: device.minFocusDistance != null,
    hasFlash: device.hasFlash ?? false,
    formatCount: device.formats.length,
  };
}

export function usePreferredCameraDevice(
  preference: CameraDevicePreference = {},
): CameraDevice | null {
  const stablePreference = useMemo(
    () => ({
      position: preference.position ?? 'back',
      preferredPhysicalDevices:
        preference.preferredPhysicalDevices ?? ['wide-angle-camera'],
      allowExternal: preference.allowExternal ?? false,
    }),
    [
      preference.allowExternal,
      preference.position,
      preference.preferredPhysicalDevices,
    ],
  );

  return useMemo(() => getPreferredCameraDevice(stablePreference), [stablePreference]);
}