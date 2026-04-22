import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, { useMemo, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  useCameraDevice,
  usePhotoOutput,
  type CameraRef,
} from 'react-native-vision-camera';

import { AppCard } from '@/components/common/AppCard';
import { AppHeader } from '@/components/common/AppHeader';
import { LoadingView } from '@/components/common/LoadingView';
import { Screen } from '@/components/common/Screen';
import { CameraPreview } from '@/features/scan/components/CameraPreview';
import { CaptureButton } from '@/features/scan/components/CaptureButton';
import { scanActions } from '@/features/scan/state/scan.actions';
import { useCameraPermission } from '@/hooks/useCameraPermission';
import type { ScanStackScreenProps } from '@/navigation/routeTypes';
import { SCAN_ROUTES } from '@/navigation/routeTypes';
import { useAppTheme, type AppTheme } from '@/providers/ThemeProvider';
import { captureStillPhoto } from '@/vision/camera/camera.capture';
import { withOpacity } from '@/theme/colorUtils';
import { layout, radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

function getStatusTone(status: ReturnType<typeof useCameraPermission>['permission']['status']) {
  switch (status) {
    case 'granted':
      return 'ready';
    case 'blocked':
    case 'denied':
    case 'unavailable':
      return 'error';
    case 'unknown':
    default:
      return 'pending';
  }
}

function getStatusCopy(
  status: ReturnType<typeof useCameraPermission>['permission']['status'],
  hasDevice: boolean,
): Readonly<{
  label: string;
  description: string;
}> {
  if (status === 'granted' && hasDevice) {
    return {
      label: 'Scanner ready',
      description: 'Frame the treadmill console, keep the key metrics inside the guide, then capture once.',
    };
  }

  if (status === 'blocked') {
    return {
      label: 'Camera blocked',
      description: 'Permission is blocked in system settings. Re-enable camera access for Tempo to continue.',
    };
  }

  if (status === 'denied') {
    return {
      label: 'Permission denied',
      description: 'Grant camera access to switch this screen from static framing mode to live capture.',
    };
  }

  if (!hasDevice) {
    return {
      label: 'Camera unavailable',
      description: 'No compatible back camera is currently available for treadmill scanning.',
    };
  }

  return {
    label: 'Permission required',
    description: 'Enable camera access so Tempo can show a live preview instead of a static scan frame.',
  };
}

export function ScanTreadmillScreen(): React.JSX.Element {
  const navigation = useNavigation<ScanStackScreenProps<'TreadmillScan'>['navigation']>();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isFocused = useIsFocused();
  const cameraRef = useRef<CameraRef | null>(null);
  const device = useCameraDevice('back');
  const photoOutput = usePhotoOutput();
  const { permission, request, refresh } = useCameraPermission();
  const [isCapturing, setIsCapturing] = useState(false);

  const statusTone = getStatusTone(permission.status);
  const statusCopy = getStatusCopy(permission.status, device != null);
  const isActionDisabled = isCapturing || (permission.isGranted && device == null);

  const handlePermissionRequest = async () => {
    const nextStatus = await request();

    if (nextStatus === 'blocked') {
      Alert.alert(
        'Camera access blocked',
        'Camera access is blocked for Tempo. Open the device app settings and allow camera access to scan the treadmill display.',
      );
    }
  };

  const handleCapture = async () => {
    if (!permission.isGranted) {
      await handlePermissionRequest();
      return;
    }

    if (!device) {
      Alert.alert(
        'Camera unavailable',
        'A compatible camera device was not found for treadmill scanning.',
      );
      return;
    }

    setIsCapturing(true);

    try {
      const captureResult = await captureStillPhoto({
        cameraRef,
        photoOutput,
      });

      if (!captureResult.ok) {
        Alert.alert('Capture failed', captureResult.error);
        return;
      }

      const ok = await scanActions.runSingleCapture(captureResult.photo);

      if (!ok) {
        Alert.alert(
          'Scan failed',
          'Tempo captured the display but could not parse the treadmill metrics from this frame.',
        );
        return;
      }

      navigation.navigate(SCAN_ROUTES.SCAN_REVIEW, {
        scanId: 'current-session',
      });
    } finally {
      setIsCapturing(false);
      await refresh();
    }
  };

  if (isCapturing) {
    return <LoadingView label="Capturing and processing treadmill display..." />;
  }

  return (
    <Screen scrollable contentStyle={styles.screenContent}>
      <AppHeader
        title="Scan Display"
        subtitle="Use a single clean capture of the treadmill console, then review parsed values before saving."
      />

      <AppCard style={styles.heroCard}>
        <View style={styles.heroRow}>
          <View
            style={[
              styles.statusPill,
              statusTone === 'ready'
                ? styles.statusPillReady
                : statusTone === 'error'
                ? styles.statusPillError
                : styles.statusPillPending,
            ]}
          >
            <MaterialIcons
              name={
                statusTone === 'ready'
                  ? 'verified'
                  : statusTone === 'error'
                  ? 'error-outline'
                  : 'radio-button-unchecked'
              }
              size={14}
              color={theme.colors.textPrimary}
            />
            <Text style={styles.statusPillText}>{statusCopy.label}</Text>
          </View>

          <View style={styles.tipBadge}>
            <Text style={styles.tipBadgeText}>Single frame OCR</Text>
          </View>
        </View>

        <Text style={styles.heroTitle}>Keep the console flat and centered.</Text>
        <Text style={styles.heroDescription}>{statusCopy.description}</Text>

        <View style={styles.tipRow}>
          <View style={styles.tipItem}>
            <MaterialIcons name="straighten" size={18} color={theme.colors.accent} />
            <Text style={styles.tipText}>Fill the guide with the metrics area</Text>
          </View>
          <View style={styles.tipItem}>
            <MaterialIcons name="wb-sunny" size={18} color={theme.colors.accent} />
            <Text style={styles.tipText}>Avoid glare and harsh highlights</Text>
          </View>
        </View>
      </AppCard>

      <CameraPreview
        cameraRef={cameraRef}
        photoOutput={photoOutput}
        device={device}
        isActive={isFocused && permission.isGranted}
        permissionStatus={permission.status}
        onRequestPermission={() => {
          void handlePermissionRequest();
        }}
      />

      <AppCard style={styles.captureCard}>
        <View style={styles.captureHeader}>
          <View style={styles.captureCopy}>
            <Text style={styles.captureTitle}>Ready when the frame looks clean</Text>
            <Text style={styles.captureDescription}>
              Capture once when the console text is sharp and fully inside the guide.
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              void refresh();
            }}
            style={({ pressed }) => [
              styles.refreshChip,
              pressed ? styles.refreshChipPressed : undefined,
            ]}
          >
            <MaterialIcons name="refresh" size={16} color={theme.colors.accent} />
            <Text style={styles.refreshChipText}>Refresh</Text>
          </Pressable>
        </View>

        <CaptureButton
          onPress={() => {
            void handleCapture();
          }}
          loading={isCapturing}
          disabled={isActionDisabled}
          label={
            permission.isGranted
              ? 'Capture Console'
              : 'Enable Camera to Scan'
          }
          hint={
            permission.isGranted
              ? 'Tempo will capture one still frame and send it into the scan review flow.'
              : 'Camera access is required before a treadmill display can be captured.'
          }
        />
      </AppCard>

      <View style={styles.bottomSpacer} />
    </Screen>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    screenContent: {
      paddingBottom: spacing.xxxl,
      gap: spacing.lg,
    },
    heroCard: {
      gap: spacing.md,
      backgroundColor: withOpacity(theme.colors.surface, theme.isDark ? 0.94 : 0.98),
      borderColor: withOpacity(theme.colors.border, 0.82),
    },
    heroRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: spacing.sm,
    },
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.pill,
      borderWidth: StyleSheet.hairlineWidth,
    },
    statusPillReady: {
      backgroundColor: withOpacity(theme.colors.success, theme.isDark ? 0.18 : 0.12),
      borderColor: withOpacity(theme.colors.success, 0.22),
    },
    statusPillError: {
      backgroundColor: withOpacity(theme.colors.danger, theme.isDark ? 0.16 : 0.1),
      borderColor: withOpacity(theme.colors.danger, 0.2),
    },
    statusPillPending: {
      backgroundColor: withOpacity(theme.colors.warning, theme.isDark ? 0.18 : 0.1),
      borderColor: withOpacity(theme.colors.warning, 0.2),
    },
    statusPillText: {
      ...typography.caption,
      color: theme.colors.textPrimary,
      fontWeight: '700',
    },
    tipBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.pill,
      backgroundColor: withOpacity(theme.colors.surfaceMuted, theme.isDark ? 0.72 : 0.86),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: withOpacity(theme.colors.border, 0.78),
    },
    tipBadgeText: {
      ...typography.caption,
      color: theme.colors.textPrimary,
      fontWeight: '700',
    },
    heroTitle: {
      ...typography.h1,
      color: theme.colors.textPrimary,
    },
    heroDescription: {
      ...typography.body,
      color: theme.colors.textSecondary,
      lineHeight: 24,
    },
    tipRow: {
      gap: spacing.sm,
    },
    tipItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.xs,
    },
    tipText: {
      ...typography.body,
      color: theme.colors.textPrimary,
      flex: 1,
    },
    captureCard: {
      gap: spacing.md,
      backgroundColor: withOpacity(theme.colors.surface, theme.isDark ? 0.94 : 0.98),
      borderColor: withOpacity(theme.colors.border, 0.82),
    },
    captureHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    captureCopy: {
      flex: 1,
      gap: spacing.xs,
    },
    captureTitle: {
      ...typography.h2,
      color: theme.colors.textPrimary,
    },
    captureDescription: {
      ...typography.body,
      color: theme.colors.textSecondary,
      lineHeight: 24,
    },
    refreshChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.pill,
      backgroundColor: withOpacity(theme.colors.surfaceMuted, theme.isDark ? 0.72 : 0.86),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: withOpacity(theme.colors.border, 0.8),
    },
    refreshChipPressed: {
      opacity: 0.8,
    },
    refreshChipText: {
      ...typography.caption,
      color: theme.colors.accent,
      fontWeight: '700',
    },
    bottomSpacer: {
      height: layout.screenVerticalPadding,
    },
  });
}
