import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { RootNavigator } from '@/navigation/RootNavigator';
import { useAppTheme } from './ThemeProvider';

/**
 * Placeholder navigation provider.
 *
 * This is intentionally lightweight for Module 1.
 * In a later module, replace AppNavigator with:
 * - Expo Router composition, or
 * - React Navigation NavigationContainer + stacks/tabs
 *
 * The provider contract remains stable so App.tsx stays clean.
 */

function AppNavigator(): React.JSX.Element {
  const { theme } = useAppTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
          backgroundColor: theme.colors.background,
        },
        card: {
          width: '100%',
          maxWidth: 720,
          borderRadius: 20,
          paddingVertical: 28,
          paddingHorizontal: 24,
          backgroundColor: theme.colors.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.border,
        },
        title: {
          fontSize: 28,
          lineHeight: 34,
          fontWeight: '700',
          color: theme.colors.textPrimary,
          marginBottom: 8,
        },
        subtitle: {
          fontSize: 16,
          lineHeight: 24,
          color: theme.colors.textSecondary,
        },
      }),
    [theme],
  );

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Tempo</Text>
        <Text style={styles.subtitle}>
          Navigation provider is mounted. Real navigation will plug in here in a
          later module.
        </Text>
      </View>
    </View>
  );
}

export function NavigationProvider(): React.JSX.Element {
  return <RootNavigator />;
};