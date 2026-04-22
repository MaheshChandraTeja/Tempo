import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { useAppTheme, type AppTheme } from '@/providers/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export type MiniBarChartDatum = Readonly<{
  label: string;
  value: number;
  color?: string;
}>;

type MiniBarChartProps = Readonly<{
  data: MiniBarChartDatum[];
  height?: number;
  showValues?: boolean;
  emptyLabel?: string;
  style?: StyleProp<ViewStyle>;
}>;

export function MiniBarChart({
  data,
  height = 120,
  showValues = false,
  emptyLabel = 'No chart data available.',
  style,
}: MiniBarChartProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, height), [theme, height]);

  const maxValue = useMemo(() => {
    if (data.length === 0) {
      return 0;
    }

    return Math.max(...data.map(item => item.value), 0);
  }, [data]);

  if (data.length === 0 || maxValue <= 0) {
    return (
      <View style={[styles.emptyRoot, style]}>
        <Text style={styles.emptyText}>{emptyLabel}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, style]}>
      <View style={styles.chartArea}>
        {data.map(item => {
          const normalizedHeight = Math.max((item.value / maxValue) * height, 6);

          return (
            <View key={item.label} style={styles.column}>
              {showValues ? (
                <Text style={styles.valueText} numberOfLines={1}>
                  {formatCompactNumber(item.value)}
                </Text>
              ) : null}

              <View
                style={[
                  styles.bar,
                  {
                    height: normalizedHeight,
                    backgroundColor: item.color ?? theme.colors.accent,
                  },
                ]}
              />

              <Text style={styles.label} numberOfLines={1}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function formatCompactNumber(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }

  return String(Math.round(value));
}

function createStyles(theme: AppTheme, height: number) {
  return StyleSheet.create({
    root: {
      width: '100%',
    },
    chartArea: {
      minHeight: height + 28,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    column: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: spacing.xs,
    },
    bar: {
      width: '100%',
      maxWidth: 28,
      borderTopLeftRadius: radius.md,
      borderTopRightRadius: radius.md,
      minHeight: 6,
    },
    valueText: {
      ...typography.caption,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    label: {
      ...typography.caption,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      width: '100%',
    },
    emptyRoot: {
      minHeight: 96,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      padding: spacing.lg,
    },
    emptyText: {
      ...typography.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });
}