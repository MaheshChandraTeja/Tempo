import { useMemo } from 'react';
import {
  getAllCameraDevices,
  getCameraDevice,
  type CameraDevice,
  type CameraPosition,
  type PhysicalDeviceType,
} from 'react-native-vision-camera';

export type CameraDevicePreference = Readonly<{
  position?: CameraPosition;
  /**
   * Prefer a simpler physical camera for faster startup.
   * Example values seen in VisionCamera docs include:
   * - 'wide-angle'
   * - 'ultra-wide-angle'
   * - 'telephoto'
   */
  preferredPhysicalDevices?: PhysicalDeviceType[];
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
): ReadonlyArray<readonly [CameraPosition, PhysicalDeviceType[] | undefined]> {
  const position = preference.position ?? 'back';
  const preferredPhysicalDevices = preference.preferredPhysicalDevices;

  const base: Array<
    readonly [CameraPosition, PhysicalDeviceType[] | undefined]
  > = [
    [position, preferredPhysicalDevices],
    [position, ['wide-angle']],
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
    const filter =
      physicalDevices == null ? undefined : { physicalDevices };
    const device = getCameraDevice([...devices], position, filter);

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
    name: device.localizedName,
    position: device.position,
    physicalDeviceCount: device.physicalDevices.length,
    supportsLowLightBoost: device.supportsLowLightBoost ?? false,
    supportsFocus:
      device.supportsFocusMetering ||
      device.supportsFocusLocking ||
      device.supportsSmoothAutoFocus,
    hasFlash: device.hasFlash ?? false,
    formatCount: device.supportedPixelFormats.length,
  };
}

export function usePreferredCameraDevice(
  preference: CameraDevicePreference = {},
): CameraDevice | null {
  const stablePreference = useMemo<CameraDevicePreference>(
    () => ({
      position: preference.position ?? 'back',
      preferredPhysicalDevices:
        preference.preferredPhysicalDevices ?? ['wide-angle'],
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
