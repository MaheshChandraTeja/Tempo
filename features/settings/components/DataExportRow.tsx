import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { useAppTheme, type AppTheme } from '@/providers/ThemeProvider';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatDate } from '@/utils/date/formatDate';

type DataExportRowProps = Readonly<{
  isExporting: boolean;
  lastExportedAt: string | null;
  onExportPress: () => void;
}>;

export function DataExportRow({
  isExporting,
  lastExportedAt,
  onExportPress,
}: DataExportRowProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <AppCard>
      <View style={styles.row}>
        <View style={styles.textWrap}>
          <Text style={styles.title}>Export Local Data</Text>
          <Text style={styles.description}>
            Export your current local workout data for backup or review.
          </Text>
          <Text style={styles.meta}>
            {lastExportedAt
              ? `Last export: ${formatDate(lastExportedAt, { preset: 'display-short' })}`
              : 'No export created yet.'}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={isExporting}
          onPress={onExportPress}
          style={({ pressed }) => [
            styles.actionButton,
            isExporting && styles.disabled,
            pressed && !isExporting ? styles.pressed : undefined,
          ]}
        >
          {isExporting ? (
            <ActivityIndicator size="small" color={theme.colors.accent} />
          ) : (
            <Text style={styles.actionLabel}>Export</Text>
          )}
        </Pressable>
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
    meta: {
      ...typography.caption,
      color: theme.colors.textSecondary,
      marginTop: spacing.xs,
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