import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { useAppTheme, type AppTheme } from '@/providers/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export type WeeklyTrendPoint = Readonly<{
  label: string;
  value: number;
}>;

type WeeklyTrendChartProps = Readonly<{
  data: WeeklyTrendPoint[];
  height?: number;
  lineColor?: string;
  pointColor?: string;
  emptyLabel?: string;
  style?: StyleProp<ViewStyle>;
}>;

type PointPosition = Readonly<{
  xPercent: number;
  y: number;
  value: number;
  label: string;
}>;

export function WeeklyTrendChart({
  data,
  height = 160,
  lineColor,
  pointColor,
  emptyLabel = 'No weekly trend data available.',
  style,
}: WeeklyTrendChartProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, height), [theme, height]);

  const points = useMemo((): PointPosition[] => {
    if (data.length === 0) {
      return [];
    }

    const values = data.map(item => item.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = Math.max(max - min, 1);

    return data.map((item, index) => {
      const xPercent =
        data.length === 1 ? 50 : (index / (data.length - 1)) * 100;
      const normalized = (item.value - min) / range;
      const y = height - normalized * (height - 20) - 10;

      return {
        xPercent,
        y,
        value: item.value,
        label: item.label,
      };
    });
  }, [data, height]);

  const segments = useMemo(() => {
    const result: Array<{
      leftPercent: number;
      top: number;
      widthPercent: number;
      angleDeg: number;
    }> = [];

    for (let i = 0; i < points.length - 1; i += 1) {
      const start = points[i];
      const end = points[i + 1];

      const dxPercent = end.xPercent - start.xPercent;
      const dy = end.y - start.y;

      result.push({
        leftPercent: start.xPercent,
        top: start.y,
        widthPercent: dxPercent,
        angleDeg: (Math.atan2(dy, dxPercent * 3) * 180) / Math.PI,
      });
    }

    return result;
  }, [points]);

  if (data.length === 0) {
    return (
      <View style={[styles.emptyRoot, style]}>
        <Text style={styles.emptyText}>{emptyLabel}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, style]}>
      <View style={styles.chartFrame}>
        <View style={styles.grid} />

        {segments.map((segment, index) => (
          <View
            key={`segment-${index}`}
            style={[
              styles.segment,
              {
                left: `${segment.leftPercent}%`,
                top: segment.top,
                width: `${segment.widthPercent}%`,
                backgroundColor: lineColor ?? theme.colors.accent,
                transform: [{ rotate: `${segment.angleDeg}deg` }],
              },
            ]}
          />
        ))}

        {points.map(point => (
          <View
            key={point.label}
            style={[
              styles.pointWrap,
              {
                left: `${point.xPercent}%`,
                top: point.y,
              },
            ]}
          >
            <View
              style={[
                styles.point,
                {
                  backgroundColor: pointColor ?? theme.colors.accent,
                },
              ]}
            />
          </View>
        ))}
      </View>

      <View style={styles.labelsRow}>
        {points.map(point => (
          <View key={`label-${point.label}`} style={styles.labelCell}>
            <Text style={styles.valueText}>{formatCompactValue(point.value)}</Text>
            <Text style={styles.labelText}>{point.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function formatCompactValue(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }

  return String(Math.round(value));
}

function createStyles(theme: AppTheme, height: number) {
  return StyleSheet.create({
    root: {
      width: '100%',
      gap: spacing.md,
    },
    chartFrame: {
      position: 'relative',
      height,
      borderRadius: radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      overflow: 'hidden',
    },
    grid: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: radius.lg,
      backgroundColor: theme.colors.surfaceMuted,
      opacity: 0.45,
    },
    segment: {
      position: 'absolute',
      height: 2,
      transformOrigin: 'left center' as never,
    },
    pointWrap: {
      position: 'absolute',
      marginLeft: -6,
      marginTop: -6,
    },
    point: {
      width: 12,
      height: 12,
      borderRadius: 999,
      borderWidth: 2,
      borderColor: theme.colors.surface,
    },
    labelsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: spacing.xs,
    },
    labelCell: {
      flex: 1,
      alignItems: 'center',
      gap: spacing.xxs,
    },
    valueText: {
      ...typography.caption,
      color: theme.colors.textPrimary,
    },
    labelText: {
      ...typography.caption,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    emptyRoot: {
      minHeight: 120,
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