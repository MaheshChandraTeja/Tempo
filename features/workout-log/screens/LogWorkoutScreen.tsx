import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { AppHeader } from '@/components/common/AppHeader';
import { Screen } from '@/components/common/Screen';
import { WorkoutForm } from '@/features/workout-log/components/WorkoutForm';
import type { WorkoutDraft } from '@/features/workout-log/domain/workout.types';
import { workoutActions } from '@/features/workout-log/state/workout.runtime';
import type { LogRouteProp, LogStackScreenProps } from '@/navigation/routeTypes';
import { LOG_ROUTES } from '@/navigation/routeTypes';

export function LogWorkoutScreen(): React.JSX.Element {
  const navigation = useNavigation<LogStackScreenProps<'LogWorkout'>['navigation']>();
  const route = useRoute<LogRouteProp<'LogWorkout'>>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialDraft = useMemo<WorkoutDraft>(
    () => ({
      date: route.params?.dateISO ?? null,
      source: 'manual',
    }),
    [route.params?.dateISO],
  );

  const handleSubmit = async (draft: WorkoutDraft) => {
    setIsSubmitting(true);

    try {
      const entry = await workoutActions.addWorkout({
        ...draft,
        source: 'manual',
      });

      if (!entry) {
        Alert.alert('Unable to save workout', 'Please review the workout details and try again.');
        return;
      }

      Alert.alert('Workout saved', 'Your workout has been logged successfully.', [
        {
          text: 'View',
          onPress: () =>
            navigation.replace(LOG_ROUTES.WORKOUT_DETAIL, { workoutId: entry.id }),
        },
        {
          text: 'Done',
          onPress: () => navigation.goBack(),
        },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen scrollable>
      <AppHeader
        title="Log Workout"
        subtitle="Create a manual workout entry with the key exercise metrics."
      />

      <WorkoutForm
        initialDraft={initialDraft}
        submitLabel="Save Workout"
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={() => navigation.goBack()}
      />
    </Screen>
  );
}