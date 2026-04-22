import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useMemo } from 'react';
import type { RefObject } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Camera,
  type CameraDevice,
  type CameraPhotoOutput,
  type CameraRef,
} from 'react-native-vision-camera';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { DisplayGuideOverlay } from '@/features/scan/components/DisplayGuideOverlay';
import type { PermissionStatus } from '@/types/common';
import { withOpacity } from '@/theme/colorUtils';
import { useAppTheme, type AppTheme } from '@/providers/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type CameraPreviewProps = Readonly<{
  cameraRef: RefObject<CameraRef | null>;
  photoOutput: CameraPhotoOutput;
  device: CameraDevice | undefined;
  isActive: boolean;
  permissionStatus: PermissionStatus;
  onRequestPermission: () => void;
}>;

function getOverlayCopy(status: PermissionStatus): Readonly<{
  title: string;
  description: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
}> {
  switch (status) {
    case 'granted':
      return {
        title: 'Preparing camera',
        description:
          'The live console preview will appear here as soon as the camera session is ready.',
        icon: 'photo-camera',
      };
    case 'blocked':
      return {
        title: 'Camera access blocked',
        description:
          'Camera access is disabled at the system level. Re-enable it in app settings to scan the console.',
        icon: 'lock-outline',
      };
    case 'denied':
      return {
        title: 'Camera access denied',
        description:
          'Tempo needs camera access to frame the treadmill console before capture.',
        icon: 'camera-alt',
      };
    case 'unavailable':
      return {
        title: 'Camera unavailable',
        description:
          'This device is not exposing a compatible camera session for scanning right now.',
        icon: 'videocam-off',
      };
    case 'unknown':
    default:
      return {
        title: 'Camera access required',
        description:
          'Allow camera access to turn this framing area into a live treadmill preview.',
        icon: 'camera-enhance',
      };
  }
}

export function CameraPreview({
  cameraRef,
  photoOutput,
  device,
  isActive,
  permissionStatus,
  onRequestPermission,
}: CameraPreviewProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const hasPermission = permissionStatus === 'granted';
  const canRenderCamera = hasPermission && device != null;
  const overlayCopy = getOverlayCopy(
    device == null && hasPermission ? 'unavailable' : permissionStatus,
  );

  return (
    <AppCard padded={false} style={styles.root}>
      <View style={styles.previewArea}>
        {canRenderCamera ? (
          <Camera
            ref={cameraRef}
            style={StyleSheet.absoluteFillObject}
            device={device}
            outputs={[photoOutput]}
            isActive={isActive}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.previewFallback} />
        )}

        <View style={styles.topBadgeRow}>
          <View style={styles.badge}>
            <MaterialIcons
              name={canRenderCamera ? 'radio-button-checked' : overlayCopy.icon}
              size={14}
              color={canRenderCamera ? theme.colors.success : theme.colors.textPrimary}
            />
            <Text style={styles.badgeText}>
              {canRenderCamera ? 'Live camera' : overlayCopy.title}
            </Text>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {device?.localizedName ?? 'Scanner'}
            </Text>
          </View>
        </View>

        <DisplayGuideOverlay active={canRenderCamera} />

        <View style={styles.bottomPanel}>
          <View style={styles.bottomCopy}>
            <Text style={styles.bottomTitle}>
              {canRenderCamera ? 'Frame the treadmill console' : overlayCopy.title}
            </Text>
            <Text style={styles.bottomDescription}>
              {canRenderCamera
                ? 'Keep the time, distance, calories, speed, and incline rows inside the guide frame.'
                : overlayCopy.description}
            </Text>
          </View>

          {!canRenderCamera &&
          (permissionStatus === 'unknown' || permissionStatus === 'denied') ? (
            <AppButton
              label="Enable Camera"
              onPress={onRequestPermission}
              style={styles.permissionButton}
            />
          ) : null}
        </View>
      </View>
    </AppCard>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    root: {
      overflow: 'hidden',
      borderRadius: radius.xl,
      backgroundColor: withOpacity(theme.colors.surface, theme.isDark ? 0.96 : 0.98),
    },
    previewArea: {
      height: 440,
      position: 'relative',
      justifyContent: 'space-between',
      backgroundColor: theme.isDark ? '#08111D' : '#DCE5EF',
    },
    previewFallback: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.isDark
        ? withOpacity(theme.colors.surfaceMuted, 0.72)
        : withOpacity(theme.colors.surfaceMuted, 0.92),
    },
    topBadgeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      gap: spacing.sm,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.pill,
      backgroundColor: withOpacity(theme.colors.background, theme.isDark ? 0.72 : 0.76),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: withOpacity(theme.colors.border, 0.8),
    },
    badgeText: {
      ...typography.caption,
      color: theme.colors.textPrimary,
      fontWeight: '700',
    },
    bottomPanel: {
      margin: spacing.md,
      padding: spacing.md,
      borderRadius: radius.xl,
      backgroundColor: withOpacity(theme.colors.background, theme.isDark ? 0.8 : 0.84),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: withOpacity(theme.colors.border, 0.8),
      gap: spacing.md,
    },
    bottomCopy: {
      gap: spacing.xs,
    },
    bottomTitle: {
      ...typography.title,
      color: theme.colors.textPrimary,
    },
    bottomDescription: {
      ...typography.body,
      color: theme.colors.textSecondary,
      lineHeight: 23,
    },
    permissionButton: {
      alignSelf: 'flex-start',
      minWidth: 160,
    },
  });
}
