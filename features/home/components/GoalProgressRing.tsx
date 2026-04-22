import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import type { GoalProgressViewModel } from '@/features/home/selectors/today.selectors';
import { useAppTheme, type AppTheme } from '@/providers/ThemeProvider';
import { withOpacity } from '@/theme/colorUtils';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type GoalProgressRingProps = Readonly<{
  progress: GoalProgressViewModel;
  title?: string;
}>;

type RingSegmentProps = Readonly<{
  angle: number;
  size: number;
  offset: number;
  active: boolean;
  activeColor: string;
  inactiveColor: string;
}>;

const TOTAL_SEGMENTS = 32;

function RingSegment({
  angle,
  size,
  offset,
  active,
  activeColor,
  inactiveColor,
}: RingSegmentProps): React.JSX.Element {
  return (
    <View
      style={[
        styles.segmentWrapper,
        {
          width: size,
          height: size,
          transform: [{ rotate: `${angle}deg` }],
        },
      ]}
    >
      <View
        style={[
          styles.segment,
          {
            marginTop: offset,
            backgroundColor: active ? activeColor : inactiveColor,
          },
        ]}
      />
    </View>
  );
}

export function GoalProgressRing({
  progress,
  title = 'Calorie target',
}: GoalProgressRingProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const dynamicStyles = useMemo(() => createStyles(theme), [theme]);

  const size = 190;
  const activeCount = Math.round(progress.ratio * TOTAL_SEGMENTS);
  const segmentOffset = 16;

  return (
    <AppCard style={dynamicStyles.card}>
      <View style={dynamicStyles.header}>
        <View style={dynamicStyles.headerCopy}>
          <Text style={dynamicStyles.eyebrow}>Pace</Text>
          <Text style={dynamicStyles.title}>{title}</Text>
          <Text style={dynamicStyles.subtitle}>
            A smooth read on how close today is to your calorie target.
          </Text>
        </View>

        <View
          style={[
            dynamicStyles.statusBadge,
            progress.isComplete
              ? dynamicStyles.statusBadgeComplete
              : dynamicStyles.statusBadgeActive,
          ]}
        >
          <Text style={dynamicStyles.statusBadgeText}>
            {progress.isComplete ? 'Complete' : 'On track'}
          </Text>
        </View>
      </View>

      <View style={dynamicStyles.centered}>
        <View style={[dynamicStyles.ringShell, { width: size, height: size }]}>
          <View style={dynamicStyles.ringHalo} />

          <View style={[dynamicStyles.ring, { width: size, height: size }]}>
            {Array.from({ length: TOTAL_SEGMENTS }, (_, index) => {
              const angle = (360 / TOTAL_SEGMENTS) * index;

              return (
                <RingSegment
                  key={`segment-${index}`}
                  angle={angle}
                  size={size}
                  offset={segmentOffset}
                  active={index < activeCount}
                  activeColor={theme.colors.accent}
                  inactiveColor={withOpacity(
                    theme.colors.border,
                    theme.isDark ? 0.45 : 0.7,
                  )}
                />
              );
            })}

            <View style={dynamicStyles.innerCircle}>
              <View style={dynamicStyles.percentageRow}>
                <MaterialIcons
                  name="local-fire-department"
                  size={18}
                  color={theme.colors.accent}
                />
                <Text style={dynamicStyles.percentage}>
                  {progress.percentage}%
                </Text>
              </View>
              <Text style={dynamicStyles.progressText}>
                {progress.current} / {progress.goal} kcal
              </Text>
              <Text style={dynamicStyles.remainingText}>
                {progress.isComplete
                  ? 'Target reached for today'
                  : `${progress.remaining} kcal remaining`}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={dynamicStyles.statRow}>
        <View style={dynamicStyles.statTile}>
          <Text style={dynamicStyles.statLabel}>Current burn</Text>
          <Text style={dynamicStyles.statValue}>{progress.current} kcal</Text>
        </View>
        <View style={dynamicStyles.statTile}>
          <Text style={dynamicStyles.statLabel}>Target</Text>
          <Text style={dynamicStyles.statValue}>{progress.goal} kcal</Text>
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  segmentWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  segment: {
    width: 6,
    height: 18,
    borderRadius: radius.pill,
  },
});

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      gap: spacing.lg,
      backgroundColor: withOpacity(theme.colors.surface, theme.isDark ? 0.92 : 0.97),
      borderColor: withOpacity(theme.colors.border, 0.85),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: spacing.md,
    },
    headerCopy: {
      flex: 1,
      gap: spacing.xs,
    },
    eyebrow: {
      ...typography.caption,
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      fontWeight: '700',
    },
    title: {
      ...typography.h2,
      color: theme.colors.textPrimary,
    },
    subtitle: {
      ...typography.body,
      color: theme.colors.textSecondary,
      lineHeight: 24,
    },
    statusBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.pill,
      borderWidth: StyleSheet.hairlineWidth,
    },
    statusBadgeActive: {
      backgroundColor: withOpacity(theme.colors.accent, theme.isDark ? 0.14 : 0.08),
      borderColor: withOpacity(theme.colors.accent, 0.2),
    },
    statusBadgeComplete: {
      backgroundColor: withOpacity(theme.colors.success, theme.isDark ? 0.18 : 0.12),
      borderColor: withOpacity(theme.colors.success, 0.22),
    },
    statusBadgeText: {
      ...typography.caption,
      color: theme.colors.textPrimary,
      fontWeight: '700',
    },
    centered: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    ringShell: {
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    ringHalo: {
      position: 'absolute',
      width: 132,
      height: 132,
      borderRadius: 66,
      backgroundColor: withOpacity(theme.colors.accent, theme.isDark ? 0.12 : 0.08),
    },
    ring: {
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    innerCircle: {
      width: 122,
      height: 122,
      borderRadius: 61,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: withOpacity(theme.colors.surfaceMuted, theme.isDark ? 0.78 : 0.88),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: withOpacity(theme.colors.border, 0.75),
      paddingHorizontal: spacing.md,
      gap: spacing.xxs,
    },
    percentageRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    percentage: {
      ...typography.h1,
      color: theme.colors.textPrimary,
    },
    progressText: {
      ...typography.caption,
      color: theme.colors.textPrimary,
      textAlign: 'center',
      fontWeight: '700',
    },
    remainingText: {
      ...typography.caption,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    statRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    statTile: {
      flex: 1,
      padding: spacing.md,
      borderRadius: radius.lg,
      backgroundColor: withOpacity(theme.colors.surfaceMuted, theme.isDark ? 0.68 : 0.8),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: withOpacity(theme.colors.border, 0.75),
      gap: spacing.xs,
    },
    statLabel: {
      ...typography.caption,
      color: theme.colors.textSecondary,
    },
    statValue: {
      ...typography.title,
      color: theme.colors.textPrimary,
    },
  });
}
