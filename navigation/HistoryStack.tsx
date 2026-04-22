import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { DayLogScreen } from '@/features/history/screens/DayLogScreen';
import { HistoryScreen } from '@/features/history/screens/HistoryScreen';
import { TrendsScreen } from '@/features/history/screens/TrendsScreen';
import { WorkoutDetailScreen } from '@/features/workout-log/screens/WorkoutDetailScreen';
import type { HistoryStackParamList } from '@/navigation/routeTypes';
import { HISTORY_ROUTES } from '@/navigation/routeTypes';
import { useAppTheme } from '@/providers/ThemeProvider';

const Stack = createNativeStackNavigator<HistoryStackParamList>();

export function HistoryStack(): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <Stack.Navigator
      initialRouteName={HISTORY_ROUTES.HISTORY_HOME}
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
        name={HISTORY_ROUTES.HISTORY_HOME}
        component={HistoryScreen}
        options={{ title: 'History' }}
      />
      <Stack.Screen
        name={HISTORY_ROUTES.DAY_LOG}
        component={DayLogScreen}
        options={{ title: 'Day Log' }}
      />
      <Stack.Screen
        name={HISTORY_ROUTES.TRENDS}
        component={TrendsScreen}
        options={{ title: 'Trends' }}
      />
      <Stack.Screen
        name={HISTORY_ROUTES.WORKOUT_DETAIL}
        component={WorkoutDetailScreen}
        options={{ title: 'Workout Details' }}
      />
    </Stack.Navigator>
  );
}