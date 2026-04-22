import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { useAppTheme, type AppTheme } from '@/providers/ThemeProvider';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export function PrivacyCard(): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <AppCard>
      <Text style={styles.title}>Privacy First</Text>
      <Text style={styles.body}>
        Tempo stores workout logs, scan results, and preferences locally on your device.
        Your data is not uploaded to a cloud backend by this app.
      </Text>

      <View style={styles.points}>
        <Text style={styles.point}>• Workout and calorie data stays local.</Text>
        <Text style={styles.point}>• Camera access is only used for treadmill scanning.</Text>
        <Text style={styles.point}>• Export is user-initiated and explicit.</Text>
        <Text style={styles.point}>• Clearing data permanently removes local app records.</Text>
      </View>
    </AppCard>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    title: {
      ...typography.h2,
      color: theme.colors.textPrimary,
      marginBottom: spacing.sm,
    },
    body: {
      ...typography.body,
      color: theme.colors.textSecondary,
      marginBottom: spacing.md,
    },
    points: {
      gap: spacing.xs,
    },
    point: {
      ...typography.body,
      color: theme.colors.textPrimary,
    },
  });
}