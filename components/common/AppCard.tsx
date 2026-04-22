import React, { PropsWithChildren, useMemo } from 'react';
import {
    StyleProp,
    StyleSheet,
    View,
    ViewStyle,
} from 'react-native';

import { useAppTheme } from '@/providers/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { elevation } from '@/theme/tokens';

type AppCardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}>;

export function AppCard({
  children,
  style,
  padded = true,
}: AppCardProps): React.JSX.Element {
  const { theme } = useAppTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderWidth: StyleSheet.hairlineWidth,
          borderRadius: radius.xl,
          ...(elevation.card as ViewStyle),
        },
        padded: {
          padding: spacing.lg,
        },
      }),
    [theme.colors],
  );

  return (
    <View style={[styles.card, padded && styles.padded, style]}>
      {children}
    </View>
  );
}