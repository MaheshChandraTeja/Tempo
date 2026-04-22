import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
    WORKOUT_KINDS,
    type WorkoutKind,
} from '@/features/workout-log/domain/workout.types';
import { useAppTheme, type AppTheme } from '@/providers/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type ExerciseTypePickerProps = Readonly<{
  value: WorkoutKind | null;
  onChange: (next: WorkoutKind) => void;
}>;

function toDisplayLabel(kind: WorkoutKind): string {
  return kind
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function ExerciseTypePicker({
  value,
  onChange,
}: ExerciseTypePickerProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View>
      <Text style={styles.label}>Exercise Type</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {WORKOUT_KINDS.map(kind => {
          const isSelected = value === kind;

          return (
            <Pressable
              key={kind}
              accessibilityRole="button"
              onPress={() => onChange(kind)}
              style={({ pressed }) => [
                styles.chip,
                isSelected && styles.chipSelected,
                pressed && styles.chipPressed,
              ]}
            >
              <Text
                style={[
                  styles.chipLabel,
                  isSelected && styles.chipLabelSelected,
                ]}
              >
                {toDisplayLabel(kind)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    label: {
      ...typography.bodyStrong,
      color: theme.colors.textPrimary,
      marginBottom: spacing.xs,
    },
    scrollContent: {
      gap: spacing.sm,
      paddingVertical: spacing.xs,
      paddingRight: spacing.md,
    },
    chip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    chipSelected: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
    },
    chipPressed: {
      opacity: 0.85,
    },
    chipLabel: {
      ...typography.body,
      color: theme.colors.textPrimary,
      fontWeight: '600',
    },
    chipLabelSelected: {
      color: '#FFFFFF',
    },
  });
}