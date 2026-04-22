import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { TodayScreen } from '@/features/home/screens/TodayScreen';
import { EditWorkoutScreen } from '@/features/workout-log/screens/EditWorkoutScreen';
import { LogWorkoutScreen } from '@/features/workout-log/screens/LogWorkoutScreen';
import { WorkoutDetailScreen } from '@/features/workout-log/screens/WorkoutDetailScreen';
import type { LogStackParamList } from '@/navigation/routeTypes';
import { LOG_ROUTES } from '@/navigation/routeTypes';
import { useAppTheme } from '@/providers/ThemeProvider';

const Stack = createNativeStackNavigator<LogStackParamList>();

export function LogStack(): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <Stack.Navigator
      initialRouteName={LOG_ROUTES.TODAY_HOME}
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
        name={LOG_ROUTES.TODAY_HOME}
        component={TodayScreen}
        options={{ title: 'Today' }}
      />
      <Stack.Screen
        name={LOG_ROUTES.LOG_WORKOUT}
        component={LogWorkoutScreen}
        options={{ title: 'Log Workout' }}
      />
      <Stack.Screen
        name={LOG_ROUTES.WORKOUT_DETAIL}
        component={WorkoutDetailScreen}
        options={{ title: 'Workout Details' }}
      />
      <Stack.Screen
        name={LOG_ROUTES.EDIT_WORKOUT}
        component={EditWorkoutScreen}
        options={{ title: 'Edit Workout' }}
      />
    </Stack.Navigator>
  );
}