import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { useAppTheme } from '@/providers/ThemeProvider';
import { spacing } from '@/theme/spacing';

type DividerProps = Readonly<{
  spacingVertical?: number;
  style?: StyleProp<ViewStyle>;
}>;

export function Divider({
  spacingVertical = spacing.md,
  style,
}: DividerProps): React.JSX.Element {
  const { theme } = useAppTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        divider: {
          height: StyleSheet.hairlineWidth,
          backgroundColor: theme.colors.border,
          marginVertical: spacingVertical,
        },
      }),
    [spacingVertical, theme.colors.border],
  );

  return <View style={[styles.divider, style]} />;
}