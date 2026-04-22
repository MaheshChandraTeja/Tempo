import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { withOpacity } from '@/theme/colorUtils';
import { useAppTheme, type AppTheme } from '@/providers/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type DisplayGuideOverlayProps = Readonly<{
  active?: boolean;
}>;

export function DisplayGuideOverlay({
  active = true,
}: DisplayGuideOverlayProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, active), [theme, active]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      <View style={styles.centerWrap}>
        <View style={styles.guideBox}>
          <View style={styles.cornerTopLeft} />
          <View style={styles.cornerTopRight} />
          <View style={styles.cornerBottomLeft} />
          <View style={styles.cornerBottomRight} />

          <View style={styles.captionWrap}>
            <Text style={styles.caption}>Fit the console inside this frame</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function createStyles(theme: AppTheme, active: boolean) {
  const guideColor = active
    ? theme.colors.accent
    : withOpacity(theme.colors.textSecondary, 0.7);

  return StyleSheet.create({
    centerWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
    },
    guideBox: {
      width: '84%',
      height: '30%',
      borderRadius: radius.xl,
      borderWidth: 2,
      borderColor: withOpacity(guideColor, 0.95),
      backgroundColor: withOpacity(theme.colors.background, active ? 0.08 : 0.16),
      position: 'relative',
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingBottom: spacing.sm,
    },
    captionWrap: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.pill,
      backgroundColor: withOpacity(theme.colors.background, 0.84),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: withOpacity(theme.colors.border, 0.7),
    },
    caption: {
      ...typography.caption,
      color: theme.colors.textPrimary,
      fontWeight: '700',
      textAlign: 'center',
    },
    cornerTopLeft: {
      ...cornerBase(guideColor),
      top: -2,
      left: -2,
      borderRightWidth: 0,
      borderBottomWidth: 0,
      borderTopLeftRadius: radius.xl,
    },
    cornerTopRight: {
      ...cornerBase(guideColor),
      top: -2,
      right: -2,
      borderLeftWidth: 0,
      borderBottomWidth: 0,
      borderTopRightRadius: radius.xl,
    },
    cornerBottomLeft: {
      ...cornerBase(guideColor),
      bottom: -2,
      left: -2,
      borderRightWidth: 0,
      borderTopWidth: 0,
      borderBottomLeftRadius: radius.xl,
    },
    cornerBottomRight: {
      ...cornerBase(guideColor),
      bottom: -2,
      right: -2,
      borderLeftWidth: 0,
      borderTopWidth: 0,
      borderBottomRightRadius: radius.xl,
    },
  });
}

function cornerBase(color: string) {
  return {
    position: 'absolute' as const,
    width: 28,
    height: 28,
    borderColor: color,
    borderWidth: 4,
  };
}
