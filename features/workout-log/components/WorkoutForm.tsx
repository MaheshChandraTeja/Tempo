import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { FormSection } from '@/components/forms/FormSection';
import { ExerciseTypePicker } from '@/features/workout-log/components/ExerciseTypePicker';
import { MetricInput } from '@/features/workout-log/components/MetricInput';
import { validateWorkoutDraft } from '@/features/workout-log/domain/workout.schema';
import type {
  WorkoutDraft,
  WorkoutKind,
} from '@/features/workout-log/domain/workout.types';
import { useAppTheme, type AppTheme } from '@/providers/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type WorkoutFormProps = Readonly<{
  initialDraft?: WorkoutDraft;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (draft: WorkoutDraft) => Promise<void> | void;
  onCancel?: () => void;
}>;

type FieldErrors = Readonly<{
  kind?: string;
  durationSeconds?: string;
  caloriesKcal?: string;
  distanceKm?: string;
  inclinePercent?: string;
  notes?: string;
}>;

function mapValidationErrors(issues: readonly { field: string; message: string }[]): FieldErrors {
  const next: Partial<FieldErrors> = {};

  for (const issue of issues) {
    if (issue.field === 'kind') {
      next.kind = issue.message;
    }

    if (issue.field === 'metrics.durationSeconds') {
      next.durationSeconds = issue.message;
    }

    if (issue.field === 'metrics.caloriesKcal') {
      next.caloriesKcal = issue.message;
    }

    if (issue.field === 'metrics.distanceKm') {
      next.distanceKm = issue.message;
    }

    if (issue.field === 'metrics.inclinePercent') {
      next.inclinePercent = issue.message;
    }

    if (issue.field === 'notes' || issue.field === 'notes.notes') {
      next.notes = issue.message;
    }
  }

  return next;
}

export function WorkoutForm({
  initialDraft,
  submitLabel,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: WorkoutFormProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [kind, setKind] = useState<WorkoutKind | null>(initialDraft?.kind ?? null);
  const [durationSeconds, setDurationSeconds] = useState<number | null>(
    initialDraft?.durationSeconds ?? null,
  );
  const [caloriesKcal, setCaloriesKcal] = useState<number | null>(
    initialDraft?.caloriesKcal ?? null,
  );
  const [distanceKm, setDistanceKm] = useState<number | null>(
    initialDraft?.distanceKm ?? null,
  );
  const [inclinePercent, setInclinePercent] = useState<number | null>(
    initialDraft?.inclinePercent ?? null,
  );
  const [notes, setNotes] = useState<string>(initialDraft?.notes ?? '');
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleSubmit = async () => {
    const draft: WorkoutDraft = {
      ...initialDraft,
      kind,
      source: initialDraft?.source ?? 'manual',
      durationSeconds,
      caloriesKcal,
      distanceKm,
      inclinePercent,
      notes,
      title: initialDraft?.title ?? null,
    };

    const validation = validateWorkoutDraft(draft);

    if (!validation.ok) {
      setFieldErrors(mapValidationErrors(validation.issues));
      setFormError(validation.issues[0]?.message ?? 'Please review the form.');
      return;
    }

    setFieldErrors({});
    setFormError(null);

    await onSubmit(draft);
  };

  return (
    <View style={styles.root}>
      <FormSection
        title="Workout Basics"
        description="Capture the workout type and the key metrics for this session."
      >
        <ExerciseTypePicker value={kind} onChange={setKind} />
        {fieldErrors.kind ? <Text style={styles.errorText}>{fieldErrors.kind}</Text> : null}

        <MetricInput
          kind="duration"
          label="Duration"
          value={durationSeconds}
          onChange={setDurationSeconds}
          helperText="Hours, minutes, and seconds."
          errorText={fieldErrors.durationSeconds}
        />

        <MetricInput
          kind="number"
          label="Calories"
          value={caloriesKcal}
          onChange={setCaloriesKcal}
          unitLabel="kcal"
          min={0}
          max={10000}
          step={10}
          helperText="Leave empty if you want calories estimated later."
          errorText={fieldErrors.caloriesKcal}
        />

        <MetricInput
          kind="number"
          label="Distance"
          value={distanceKm}
          onChange={setDistanceKm}
          unitLabel="km"
          min={0}
          max={300}
          step={0.1}
          decimals={2}
          errorText={fieldErrors.distanceKm}
        />

        <MetricInput
          kind="number"
          label="Incline"
          value={inclinePercent}
          onChange={setInclinePercent}
          unitLabel="%"
          min={0}
          max={40}
          step={0.5}
          decimals={1}
          errorText={fieldErrors.inclinePercent}
        />
      </FormSection>

      <FormSection
        title="Notes"
        description="Optional context like treadmill profile, difficulty, or anything worth remembering."
      >
        <View>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            multiline
            onChangeText={setNotes}
            placeholder="Add workout notes..."
            placeholderTextColor={theme.colors.textSecondary}
            style={styles.notesInput}
            textAlignVertical="top"
            value={notes}
          />
          {fieldErrors.notes ? <Text style={styles.errorText}>{fieldErrors.notes}</Text> : null}
        </View>
      </FormSection>

      {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

      <View style={styles.actions}>
        {onCancel ? (
          <AppButton
            label="Cancel"
            onPress={onCancel}
            variant="secondary"
            fullWidth
          />
        ) : null}

        <AppButton
          label={submitLabel}
          onPress={handleSubmit}
          loading={isSubmitting}
          fullWidth
        />
      </View>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    root: {
      gap: spacing.lg,
    },
    label: {
      ...typography.bodyStrong,
      color: theme.colors.textPrimary,
      marginBottom: spacing.xs,
    },
    notesInput: {
      minHeight: 120,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      color: theme.colors.textPrimary,
      ...typography.body,
    },
    actions: {
      gap: spacing.md,
      marginTop: spacing.sm,
    },
    errorText: {
      ...typography.caption,
      color: theme.colors.danger,
    },
  });
}