import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { ConfidenceBadge } from '@/features/scan/components/ConfidenceBadge';
import type { ScanFieldViewModel } from '@/features/scan/domain/scan.types';
import { useAppTheme, type AppTheme } from '@/providers/ThemeProvider';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type ParsedFieldCardProps = Readonly<{
  field: ScanFieldViewModel;
}>;

export function ParsedFieldCard({
  field,
}: ParsedFieldCardProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <AppCard>
      <View style={styles.header}>
        <Text style={styles.label}>{field.label}</Text>
        <ConfidenceBadge value={field.confidence} />
      </View>

      <Text style={styles.value}>{field.valueText}</Text>

      {field.warningText ? (
        <Text style={styles.warning}>{field.warningText}</Text>
      ) : null}
    </AppCard>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: spacing.md,
      marginBottom: spacing.sm,
    },
    label: {
      ...typography.h2,
      color: theme.colors.textPrimary,
    },
    value: {
      ...typography.h1,
      color: theme.colors.textPrimary,
      marginBottom: spacing.xs,
    },
    warning: {
      ...typography.caption,
      color: theme.colors.warning,
    },
  });
}