import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { useAppTheme } from '@/providers/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type EmptyStateProps = Readonly<{
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
}>;

export function EmptyState({
  title,
  description,
  actionLabel,
  onActionPress,
}: EmptyStateProps): React.JSX.Element {
  const { theme } = useAppTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          padding: spacing.xl,
          borderRadius: radius.xl,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.surfaceMuted,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.border,
        },
        title: {
          ...typography.h2,
          color: theme.colors.textPrimary,
          textAlign: 'center',
          marginBottom: spacing.sm,
        },
        description: {
          ...typography.body,
          color: theme.colors.textSecondary,
          textAlign: 'center',
          marginBottom: actionLabel ? spacing.lg : 0,
        },
        action: {
          minWidth: 180,
        },
      }),
    [theme.colors],
  );

  return (
    <View style={styles.root}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {actionLabel ? (
        <AppButton
          label={actionLabel}
          onPress={onActionPress}
          style={styles.action}
        />
      ) : null}
    </View>
  );
}