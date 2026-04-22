import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type PropsWithChildren,
} from 'react';

export type PermissionName =
  | 'camera'
  | 'notifications'
  | 'mediaLibrary'
  | 'motion'
  | 'health';

export type PermissionStatus =
  | 'unknown'
  | 'granted'
  | 'denied'
  | 'blocked'
  | 'unavailable';

export type PermissionsState = Readonly<Record<PermissionName, PermissionStatus>>;

type PermissionsContextValue = Readonly<{
  permissions: PermissionsState;
  refreshPermission: (permission: PermissionName) => Promise<PermissionStatus>;
  requestPermission: (permission: PermissionName) => Promise<PermissionStatus>;
}>;

const initialPermissionsState: PermissionsState = Object.freeze({
  camera: 'unknown',
  notifications: 'unknown',
  mediaLibrary: 'unknown',
  motion: 'unknown',
  health: 'unknown',
});

const PermissionsContext = createContext<PermissionsContextValue | undefined>(
  undefined,
);

/**
 * Placeholder provider.
 *
 * In later modules, replace the internal implementations with platform-specific
 * permission adapters, for example:
 * - expo-camera
 * - expo-notifications
 * - expo-image-picker / media library
 * - expo-sensors / motion permissions
 * - HealthKit / Google Fit bridge
 */
export function PermissionsProvider({
  children,
}: PropsWithChildren): React.JSX.Element {
  const [permissions, setPermissions] = useState<PermissionsState>(
    initialPermissionsState,
  );

  const refreshPermission = useCallback(
    async (permission: PermissionName): Promise<PermissionStatus> => {
      const currentStatus = permissions[permission] ?? 'unknown';
      return currentStatus;
    },
    [permissions],
  );

  const requestPermission = useCallback(
    async (permission: PermissionName): Promise<PermissionStatus> => {
      /**
       * Intentional placeholder.
       * This shell keeps the provider contract stable until permission modules land.
       */
      const nextStatus: PermissionStatus = 'unknown';

      setPermissions(current => ({
        ...current,
        [permission]: nextStatus,
      }));

      return nextStatus;
    },
    [],
  );

  const value = useMemo<PermissionsContextValue>(
    () =>
      Object.freeze({
        permissions,
        refreshPermission,
        requestPermission,
      }),
    [permissions, refreshPermission, requestPermission],
  );

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions(): PermissionsContextValue {
  const context = useContext(PermissionsContext);

  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider.');
  }

  return context;
}