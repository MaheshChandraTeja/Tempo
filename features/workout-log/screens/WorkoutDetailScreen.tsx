import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppHeader } from '@/components/common/AppHeader';
import { Divider } from '@/components/common/Divider';
import { LoadingView } from '@/components/common/LoadingView';
import { Screen } from '@/components/common/Screen';
import { SourceBadge } from '@/features/workout-log/components/SourceBadge';
import {
  useWorkoutSelector,
  workoutActions,
} from '@/features/workout-log/state/workout.runtime';
import { selectWorkoutById } from '@/features/workout-log/state/workout.selectors';
import type {
  HistoryRouteProp,
  LogRouteProp,
  RootStackParamList
} from '@/navigation/routeTypes';
import { LOG_ROUTES, ROOT_ROUTES, TAB_ROUTES } from '@/navigation/routeTypes';
import { useAppTheme, type AppTheme } from '@/providers/ThemeProvider';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatDate } from '@/utils/date/formatDate';
import { useNavigation, useRoute, type NavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

type BasicNavigation = NavigationProp<Record<string, object | undefined>>;
type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

type WorkoutDetailRoute =
  | LogRouteProp<'WorkoutDetail'>
  | HistoryRouteProp<'WorkoutDetail'>;

function formatDuration(seconds: number | null): string {
  if (seconds == null || seconds <= 0) {
    return '—';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  return `${remainingSeconds}s`;
}

function formatWorkoutKind(kind: string): string {
  return kind
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function MetricRow({
  label,
  value,
}: Readonly<{ label: string; value: string }>): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

export function WorkoutDetailScreen(): React.JSX.Element {
  const navigation = useNavigation<BasicNavigation>();
  const rootNavigation = useNavigation<RootNavigation>();
  const route = useRoute<WorkoutDetailRoute>();
  const workoutId = route.params.workoutId;

  const entry = useWorkoutSelector(state => selectWorkoutById(state, workoutId));
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    void workoutActions.initialize();
  }, []);

  const handleDelete = async () => {
    if (!entry) {
      return;
    }

    setIsDeleting(true);

    try {
      const ok = await workoutActions.deleteWorkout(entry.id);

      if (!ok) {
        Alert.alert('Delete failed', 'The workout could not be deleted.');
        return;
      }

      Alert.alert('Workout deleted', 'The workout entry has been removed.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!entry) {
    return <LoadingView label="Loading workout..." />;
  }
  
  return (
    <Screen scrollable>
      <AppHeader
        title={entry.notes.title ?? formatWorkoutKind(entry.kind)}
        subtitle={formatDate(entry.loggedAt, { preset: 'display-medium' })}
        rightActionLabel="Edit"
        onRightActionPress={() =>
          rootNavigation.navigate(ROOT_ROUTES.MAIN_TABS, {
            screen: TAB_ROUTES.LOG_STACK,
            params: {
              screen: LOG_ROUTES.EDIT_WORKOUT,
              params: { workoutId: entry.id },
            },
          })
        }
      />

      <SourceBadge source={entry.source} />

      <AppCard>
        <MetricRow label="Exercise Type" value={formatWorkoutKind(entry.kind)} />
        <Divider />
        <MetricRow label="Duration" value={formatDuration(entry.metrics.durationSeconds)} />
        <Divider />
        <MetricRow
          label="Calories"
          value={
            entry.metrics.caloriesKcal != null ? `${entry.metrics.caloriesKcal} kcal` : '—'
          }
        />
        <Divider />
        <MetricRow
          label="Distance"
          value={entry.metrics.distanceKm != null ? `${entry.metrics.distanceKm} km` : '—'}
        />
        <Divider />
        <MetricRow
          label="Incline"
          value={
            entry.metrics.inclinePercent != null ? `${entry.metrics.inclinePercent}%` : '—'
          }
        />
      </AppCard>

      <AppCard>
        <Text style={detailStyles.sectionTitle}>Notes</Text>
        <Text style={detailStyles.notesText}>
          {entry.notes.notes && entry.notes.notes.trim().length > 0
            ? entry.notes.notes
            : 'No notes added for this workout.'}
        </Text>
      </AppCard>

      <AppButton
        label="Delete Workout"
        variant="danger"
        loading={isDeleting}
        onPress={handleDelete}
        fullWidth
      />
    </Screen>
  );
}

const detailStyles = StyleSheet.create({
  sectionTitle: {
    ...typography.h2,
    marginBottom: spacing.sm,
  },
  notesText: {
    ...typography.body,
  },
});

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    metricRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    metricLabel: {
      ...typography.body,
      color: theme.colors.textSecondary,
      flex: 1,
    },
    metricValue: {
      ...typography.bodyStrong,
      color: theme.colors.textPrimary,
      flex: 1,
      textAlign: 'right',
    },
  });
}