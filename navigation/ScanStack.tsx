import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { ReviewScanScreen } from '@/features/scan/screens/ReviewScanScreen';
import { ScanDebugScreen } from '@/features/scan/screens/ScanDebugScreen';
import { ScanIntroScreen } from '@/features/scan/screens/ScanIntroScreen';
import { ScanTreadmillScreen } from '@/features/scan/screens/ScanTreadmillScreen';
import type { ScanStackParamList } from '@/navigation/routeTypes';
import { SCAN_ROUTES } from '@/navigation/routeTypes';
import { useAppTheme } from '@/providers/ThemeProvider';

const Stack = createNativeStackNavigator<ScanStackParamList>();

export function ScanStack(): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <Stack.Navigator
      initialRouteName={SCAN_ROUTES.SCAN_HOME}
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: {
          fontWeight: '700',
        },
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen
        name={SCAN_ROUTES.SCAN_HOME}
        component={ScanIntroScreen}
        options={{ title: 'Scan' }}
      />
      <Stack.Screen
        name={SCAN_ROUTES.TREADMILL_SCAN}
        component={ScanTreadmillScreen}
        options={{ title: 'Treadmill Scan' }}
      />
      <Stack.Screen
        name={SCAN_ROUTES.SCAN_REVIEW}
        component={ReviewScanScreen}
        options={{ title: 'Review Scan' }}
      />
      <Stack.Screen
        name={SCAN_ROUTES.SCAN_DEBUG}
        component={ScanDebugScreen}
        options={{ title: 'Scan Debug' }}
      />
    </Stack.Navigator>
  );
}