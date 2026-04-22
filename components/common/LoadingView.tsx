import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/providers/ThemeProvider';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type LoadingViewProps = Readonly<{
  label?: string;
}>;

export function LoadingView({
  label = 'Loading...',
}: LoadingViewProps): React.JSX.Element {
  const { theme } = useAppTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing.xl,
          gap: spacing.md,
        },
        label: {
          ...typography.body,
          color: theme.colors.textSecondary,
          textAlign: 'center',
        },
      }),
    [theme.colors],
  );

  return (
    <View style={styles.root}>
      <ActivityIndicator size="large" color={theme.colors.accent} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}