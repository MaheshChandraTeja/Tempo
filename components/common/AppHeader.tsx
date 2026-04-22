import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/providers/ThemeProvider';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type AppHeaderProps = Readonly<{
  title: string;
  subtitle?: string;
  leftActionLabel?: string;
  onLeftActionPress?: () => void;
  rightActionLabel?: string;
  onRightActionPress?: () => void;
}>;

export function AppHeader({
  title,
  subtitle,
  leftActionLabel,
  onLeftActionPress,
  rightActionLabel,
  onRightActionPress,
}: AppHeaderProps): React.JSX.Element {
  const { theme } = useAppTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          gap: spacing.xs,
        },
        topRow: {
          minHeight: 44,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.sm,
        },
        side: {
          minWidth: 64,
        },
        sideRight: {
          alignItems: 'flex-end',
        },
        titleWrap: {
          flex: 1,
          alignItems: 'center',
        },
        title: {
          ...typography.h1,
          color: theme.colors.textPrimary,
          textAlign: 'center',
        },
        subtitle: {
          ...typography.body,
          color: theme.colors.textSecondary,
        },
        actionLabel: {
          ...typography.bodyStrong,
          color: theme.colors.accent,
        },
        actionPressed: {
          opacity: 0.7,
        },
      }),
    [theme.colors],
  );

  return (
    <View style={styles.root}>
      <View style={styles.topRow}>
        <View style={styles.side}>
          {leftActionLabel ? (
            <Pressable
              accessibilityRole="button"
              onPress={onLeftActionPress}
              style={({ pressed }) => (pressed ? styles.actionPressed : undefined)}
            >
              <Text style={styles.actionLabel}>{leftActionLabel}</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

        <View style={[styles.side, styles.sideRight]}>
          {rightActionLabel ? (
            <Pressable
              accessibilityRole="button"
              onPress={onRightActionPress}
              style={({ pressed }) => (pressed ? styles.actionPressed : undefined)}
            >
              <Text style={styles.actionLabel}>{rightActionLabel}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}