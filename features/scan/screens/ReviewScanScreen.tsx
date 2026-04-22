import { AppButton } from '@/components/common/AppButton';
import { AppHeader } from '@/components/common/AppHeader';
import { Screen } from '@/components/common/Screen';
import { FormSection } from '@/components/forms/FormSection';
import { ParsedFieldCard } from '@/features/scan/components/ParsedFieldCard';
import { scanActions } from '@/features/scan/state/scan.actions';
import { selectCurrentScanSession, selectScanFieldCards } from '@/features/scan/state/scan.selectors';
import { useScanSelector } from '@/features/scan/state/scan.store';
import { MetricInput } from '@/features/workout-log/components/MetricInput';
import type { RootStackParamList, ScanStackScreenProps } from '@/navigation/routeTypes';
import { LOG_ROUTES, ROOT_ROUTES, SCAN_ROUTES, TAB_ROUTES } from '@/navigation/routeTypes';
import { useAppTheme, type AppTheme } from '@/providers/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

export function ReviewScanScreen(): React.JSX.Element {
  const navigation = useNavigation<ScanStackScreenProps<'ScanReview'>['navigation']>();
  const rootNavigation = useNavigation<RootNavigation>();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const session = useScanSelector(selectCurrentScanSession);
  const fieldCards = useScanSelector(selectScanFieldCards);
  const [isSaving, setIsSaving] = useState(false);

  const pipeline = session.pipelineResult;
  const parsed = pipeline && pipeline.ok ? pipeline.parsed : null;

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const result = await scanActions.saveReviewedScan();

      if (!result.ok) {
        Alert.alert('Save failed', result.error);
        return;
      }

      Alert.alert('Workout saved', 'The scanned workout has been added to your log.', [
        {
          text: 'View Workout',
          onPress: () =>
            rootNavigation.navigate(ROOT_ROUTES.MAIN_TABS, {
              screen: TAB_ROUTES.LOG_STACK,
              params: {
                screen: LOG_ROUTES.WORKOUT_DETAIL,
                params: { workoutId: result.workoutId },
              },
            }),
        },
        {
          text: 'Done',
          onPress: () => navigation.popToTop(),
        },
      ]);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Screen scrollable>
      <AppHeader
        title="Review Scan"
        subtitle={
          parsed
            ? `Overall confidence ${Math.round(parsed.confidence * 100)}%`
            : 'Review parsed fields before saving.'
        }
        rightActionLabel="Debug"
        onRightActionPress={() =>
          navigation.navigate(SCAN_ROUTES.SCAN_DEBUG)
        }
      />

      {fieldCards.map(field => (
        <ParsedFieldCard key={field.id} field={field} />
      ))}

      <FormSection
        title="Edit Parsed Values"
        description="Correct anything that looks wrong before saving."
      >
        <MetricInput
          kind="duration"
          label="Duration"
          value={session.editableFields.durationSeconds}
          onChange={value => scanActions.updateField('durationSeconds', value)}
        />
        <MetricInput
          kind="number"
          label="Distance"
          value={session.editableFields.distanceKm}
          onChange={value => scanActions.updateField('distanceKm', value)}
          unitLabel="km"
          decimals={2}
          min={0}
          max={100}
          step={0.1}
        />
        <MetricInput
          kind="number"
          label="Calories"
          value={session.editableFields.caloriesKcal}
          onChange={value => scanActions.updateField('caloriesKcal', value)}
          unitLabel="kcal"
          min={0}
          max={5000}
          step={10}
        />
        <MetricInput
          kind="number"
          label="Speed"
          value={session.editableFields.speedKph}
          onChange={value => scanActions.updateField('speedKph', value)}
          unitLabel="kph"
          decimals={2}
          min={0}
          max={40}
          step={0.1}
        />
        <MetricInput
          kind="number"
          label="Incline"
          value={session.editableFields.inclinePercent}
          onChange={value => scanActions.updateField('inclinePercent', value)}
          unitLabel="%"
          decimals={1}
          min={0}
          max={30}
          step={0.5}
        />
      </FormSection>

      <FormSection
        title="Notes"
        description="Optional note to store with the scanned workout."
      >
        <View>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            multiline
            value={session.notes ?? ''}
            onChangeText={text => scanActions.updateNotes(text)}
            placeholder="Add optional scan notes..."
            placeholderTextColor={theme.colors.textSecondary}
            style={styles.notesInput}
            textAlignVertical="top"
          />
        </View>
      </FormSection>

      {session.error ? <Text style={styles.errorText}>{session.error}</Text> : null}

      <AppButton
        label="Save to Workout Log"
        onPress={handleSave}
        loading={isSaving}
        fullWidth
      />
    </Screen>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    label: {
      ...typography.bodyStrong,
      color: theme.colors.textPrimary,
      marginBottom: spacing.xs,
    },
    notesInput: {
      minHeight: 100,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      color: theme.colors.textPrimary,
      ...typography.body,
    },
    errorText: {
      ...typography.caption,
      color: theme.colors.danger,
    },
  });
}