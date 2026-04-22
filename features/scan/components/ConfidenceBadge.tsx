import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SCAN_DEFAULTS } from '@/features/scan/domain/scan.constants';
import { useAppTheme, type AppTheme } from '@/providers/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type ConfidenceBadgeProps = Readonly<{
  value: number;
}>;

export function ConfidenceBadge({
  value,
}: ConfidenceBadgeProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, value), [theme, value]);

  const percentage = Math.round(value * 100);

  return (
    <View style={styles.badge}>
      <Text style={styles.label}>{percentage}% confidence</Text>
    </View>
  );
}

function createStyles(theme: AppTheme, value: number) {
  const backgroundColor =
    value >= SCAN_DEFAULTS.goodConfidence
      ? theme.colors.success
      : value >= SCAN_DEFAULTS.warningConfidence
      ? theme.colors.warning
      : theme.colors.danger;

  return StyleSheet.create({
    badge: {
      alignSelf: 'flex-start',
      backgroundColor,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    label: {
      ...typography.caption,
      color: '#FFFFFF',
      fontWeight: '700',
    },
  });
}