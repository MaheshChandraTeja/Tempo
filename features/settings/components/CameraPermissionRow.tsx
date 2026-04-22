import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { useCameraPermission } from '@/hooks/useCameraPermission';
import { useAppTheme, type AppTheme } from '@/providers/ThemeProvider';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type CameraPermissionRowProps = Readonly<{
  isBusy?: boolean;
  onChanged?: () => void | Promise<void>;
}>;

function getPermissionLabel(status: ReturnType<typeof useCameraPermission>['permission']['status']): string {
  switch (status) {
    case 'granted':
      return 'Granted';
    case 'denied':
      return 'Denied';
    case 'blocked':
      return 'Blocked';
    case 'unavailable':
      return 'Unavailable';
    case 'unknown':
    default:
      return 'Unknown';
  }
}

export function CameraPermissionRow({
  isBusy = false,
  onChanged,
}: CameraPermissionRowProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { permission, request, refresh } = useCameraPermission();

  const statusColor =
    permission.status === 'granted'
      ? theme.colors.success
      : permission.status === 'denied' || permission.status === 'blocked'
      ? theme.colors.danger
      : theme.colors.warning;

  return (
    <AppCard>
      <View style={styles.row}>
        <View style={styles.textWrap}>
          <Text style={styles.title}>Camera Permission</Text>
          <Text style={styles.description}>
            Needed only for treadmill display scanning.
          </Text>
          <Text style={[styles.status, { color: statusColor }]}>
            Status: {getPermissionLabel(permission.status)}
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              void (async () => {
                await refresh();
                await onChanged?.();
              })();
            }}
            style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
          >
            <Text style={styles.actionLabel}>Refresh</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={isBusy || !permission.canAskAgain}
            onPress={() => {
              void (async () => {
                await request();
                await onChanged?.();
              })();
            }}
            style={({ pressed }) => [
              styles.actionButton,
              !permission.canAskAgain && styles.disabled,
              pressed && permission.canAskAgain ? styles.pressed : undefined,
            ]}
          >
            {isBusy ? (
              <ActivityIndicator size="small" color={theme.colors.accent} />
            ) : (
              <Text style={styles.actionLabel}>
                {permission.isGranted ? 'Granted' : 'Request'}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </AppCard>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: spacing.md,
    },
    textWrap: {
      flex: 1,
      gap: spacing.xxs,
    },
    title: {
      ...typography.h2,
      color: theme.colors.textPrimary,
    },
    description: {
      ...typography.body,
      color: theme.colors.textSecondary,
    },
    status: {
      ...typography.caption,
      fontWeight: '700',
      marginTop: spacing.xs,
    },
    actions: {
      gap: spacing.sm,
      alignItems: 'flex-end',
    },
    actionButton: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    actionLabel: {
      ...typography.bodyStrong,
      color: theme.colors.accent,
    },
    pressed: {
      opacity: 0.75,
    },
    disabled: {
      opacity: 0.45,
    },
  });
}
