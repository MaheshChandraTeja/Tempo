import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { AppHeader } from '@/components/common/AppHeader';
import { LoadingView } from '@/components/common/LoadingView';
import { Screen } from '@/components/common/Screen';
import { WorkoutForm } from '@/features/workout-log/components/WorkoutForm';
import { workoutEntryToDraft } from '@/features/workout-log/domain/workout.mappers';
import type { WorkoutDraft } from '@/features/workout-log/domain/workout.types';
import {
  useWorkoutSelector,
  workoutActions,
} from '@/features/workout-log/state/workout.runtime';
import { selectWorkoutById } from '@/features/workout-log/state/workout.selectors';
import type {
  LogRouteProp,
  LogStackScreenProps,
} from '@/navigation/routeTypes';
import { LOG_ROUTES } from '@/navigation/routeTypes';

export function EditWorkoutScreen(): React.JSX.Element {
  const navigation = useNavigation<LogStackScreenProps<'EditWorkout'>['navigation']>();
  const route = useRoute<LogRouteProp<'EditWorkout'>>();
  const workoutId = route.params.workoutId;

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void workoutActions.initialize();
  }, []);

  const entry = useWorkoutSelector(state => selectWorkoutById(state, workoutId));

  const initialDraft = useMemo(() => {
    return entry ? workoutEntryToDraft(entry) : undefined;
  }, [entry]);

  const handleSubmit = async (draft: WorkoutDraft) => {
    setIsSubmitting(true);

    try {
      const updated = await workoutActions.editWorkout(workoutId, draft);

      if (!updated) {
        Alert.alert('Unable to update workout', 'Please review the workout details and try again.');
        return;
      }

      Alert.alert('Workout updated', 'Your workout changes have been saved.', [
        {
          text: 'View',
          onPress: () =>
            navigation.replace(LOG_ROUTES.WORKOUT_DETAIL, {
              workoutId: updated.id,
            }),
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

  if (!entry || !initialDraft) {
    return <LoadingView label="Loading workout for editing..." />;
  }

  return (
    <Screen scrollable>
      <AppHeader
        title="Edit Workout"
        subtitle="Update the workout metrics and notes."
      />

      <WorkoutForm
        initialDraft={initialDraft}
        submitLabel="Save Changes"
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={() => navigation.goBack()}
      />
    </Screen>
  );
}