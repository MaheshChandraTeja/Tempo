import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import type { GoalProgressViewModel } from '@/features/home/selectors/today.selectors';
import { useAppTheme, type AppTheme } from '@/providers/ThemeProvider';
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

const TOTAL_SEGMENTS = 28;

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
  title = 'Calorie Goal',
}: GoalProgressRingProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const dynamicStyles = useMemo(() => createStyles(theme), [theme]);

  const size = 168;
  const activeCount = Math.round(progress.ratio * TOTAL_SEGMENTS);
  const segmentOffset = 14;

  return (
    <AppCard>
      <Text style={dynamicStyles.title}>{title}</Text>
      <Text style={dynamicStyles.subtitle}>
        Track today’s calorie progress against your target.
      </Text>

      <View style={dynamicStyles.centered}>
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
                inactiveColor={theme.colors.border}
              />
            );
          })}

          <View style={dynamicStyles.innerCircle}>
            <Text style={dynamicStyles.percentage}>{progress.percentage}%</Text>
            <Text style={dynamicStyles.progressText}>
              {progress.current} / {progress.goal} kcal
            </Text>
            <Text style={dynamicStyles.remainingText}>
              {progress.isComplete
                ? 'Goal reached'
                : `${progress.remaining} kcal remaining`}
            </Text>
          </View>
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
    width: 8,
    height: 18,
    borderRadius: radius.pill,
  },
});

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    title: {
      ...typography.h2,
      color: theme.colors.textPrimary,
      marginBottom: spacing.xs,
    },
    subtitle: {
      ...typography.body,
      color: theme.colors.textSecondary,
      marginBottom: spacing.lg,
    },
    centered: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    ring: {
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    innerCircle: {
      width: 112,
      height: 112,
      borderRadius: 56,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      paddingHorizontal: spacing.sm,
      gap: spacing.xxs,
    },
    percentage: {
      ...typography.h1,
      color: theme.colors.textPrimary,
    },
    progressText: {
      ...typography.caption,
      color: theme.colors.textPrimary,
      textAlign: 'center',
    },
    remainingText: {
      ...typography.caption,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });
}