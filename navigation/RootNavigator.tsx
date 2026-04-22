import {
  NavigationContainer,
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  NavigationIndependentTree,
  type Theme as NavigationTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';

import { MainTabs } from '@/navigation/MainTabs';
import { ROOT_ROUTES, type RootStackParamList } from '@/navigation/routeTypes';
import { useAppTheme } from '@/providers/ThemeProvider';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): React.JSX.Element {
  const { theme } = useAppTheme();

  const navigationTheme = useMemo<NavigationTheme>(() => {
    const baseTheme = theme.isDark
      ? NavigationDarkTheme
      : NavigationDefaultTheme;

    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        background: theme.colors.background,
        card: theme.colors.surface,
        text: theme.colors.textPrimary,
        border: theme.colors.border,
        primary: theme.colors.accent,
        notification: theme.colors.accent,
      },
    };
  }, [theme]);

  return (
    <NavigationIndependentTree>
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator
          initialRouteName={ROOT_ROUTES.MAIN_TABS}
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: theme.colors.background,
            },
          }}
        >
          <Stack.Screen name={ROOT_ROUTES.MAIN_TABS} component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}