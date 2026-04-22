import React, { useCallback, useMemo } from 'react';
import {
    KeyboardTypeOptions,
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    TextInput,
    View,
    ViewStyle,
} from 'react-native';

import { useAppTheme, type AppTheme } from '@/providers/ThemeProvider';
import { layout, radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type NumberFieldProps = Readonly<{
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  min?: number;
  max?: number;
  step?: number;
  decimals?: number;
  allowNegative?: boolean;
  disabled?: boolean;
  keyboardType?: KeyboardTypeOptions;
  unitLabel?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}>;

function clamp(value: number, min?: number, max?: number): number {
  let next = value;

  if (typeof min === 'number' && next < min) {
    next = min;
  }

  if (typeof max === 'number' && next > max) {
    next = max;
  }

  return next;
}

function roundToDecimals(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function formatValue(value: number | null, decimals: number): string {
  if (value === null || Number.isNaN(value)) {
    return '';
  }

  return decimals > 0 ? value.toFixed(decimals) : String(value);
}

export function NumberField({
  label,
  value,
  onChange,
  placeholder = 'Enter value',
  helperText,
  errorText,
  min,
  max,
  step = 1,
  decimals = 0,
  allowNegative = false,
  disabled = false,
  keyboardType = decimals > 0 ? 'decimal-pad' : 'number-pad',
  unitLabel,
  testID,
  style,
}: NumberFieldProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const hasError = Boolean(errorText);

  const handleTextChange = useCallback(
    (text: string) => {
      const normalized = text.trim().replace(',', '.');

      if (normalized === '') {
        onChange(null);
        return;
      }

      if (!allowNegative && normalized.startsWith('-')) {
        return;
      }

      const parsed = Number(normalized);

      if (Number.isNaN(parsed)) {
        return;
      }

      const rounded = roundToDecimals(parsed, decimals);
      const clamped = clamp(rounded, min, max);

      onChange(clamped);
    },
    [allowNegative, decimals, max, min, onChange],
  );

  const handleStepChange = useCallback(
    (direction: 'decrement' | 'increment') => {
      if (disabled) {
        return;
      }

      const baseValue = value ?? 0;
      const delta = direction === 'increment' ? step : -step;
      const next = roundToDecimals(baseValue + delta, decimals);
      const clamped = clamp(next, min, max);

      if (!allowNegative && clamped < 0) {
        onChange(0);
        return;
      }

      onChange(clamped);
    },
    [allowNegative, decimals, disabled, max, min, onChange, step, value],
  );

  return (
    <View style={style}>
      <Text style={styles.label}>{label}</Text>

      <View
        style={[
          styles.inputShell,
          hasError && styles.inputShellError,
          disabled && styles.inputShellDisabled,
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label}`}
          disabled={disabled}
          onPress={() => handleStepChange('decrement')}
          style={({ pressed }) => [
            styles.stepButton,
            pressed && !disabled ? styles.stepButtonPressed : undefined,
          ]}
          testID={testID ? `${testID}-decrement` : undefined}
        >
          <Text style={styles.stepButtonText}>−</Text>
        </Pressable>

        <View style={styles.inputContent}>
          <TextInput
            editable={!disabled}
            keyboardType={keyboardType}
            onChangeText={handleTextChange}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textSecondary}
            style={styles.input}
            testID={testID}
            value={formatValue(value, decimals)}
          />

          {unitLabel ? <Text style={styles.unitLabel}>{unitLabel}</Text> : null}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label}`}
          disabled={disabled}
          onPress={() => handleStepChange('increment')}
          style={({ pressed }) => [
            styles.stepButton,
            pressed && !disabled ? styles.stepButtonPressed : undefined,
          ]}
          testID={testID ? `${testID}-increment` : undefined}
        >
          <Text style={styles.stepButtonText}>+</Text>
        </Pressable>
      </View>

      {errorText ? (
        <Text style={styles.errorText}>{errorText}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
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
    inputShell: {
      minHeight: layout.minTouchTarget + 8,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      flexDirection: 'row',
      alignItems: 'stretch',
      overflow: 'hidden',
    },
    inputShellError: {
      borderColor: theme.colors.danger,
    },
    inputShellDisabled: {
      opacity: 0.6,
    },
    inputContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      gap: spacing.sm,
    },
    input: {
      flex: 1,
      minHeight: layout.minTouchTarget + 6,
      color: theme.colors.textPrimary,
      ...typography.body,
      paddingVertical: spacing.sm,
    },
    unitLabel: {
      ...typography.caption,
      color: theme.colors.textSecondary,
    },
    stepButton: {
      width: 52,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceMuted,
      borderColor: theme.colors.border,
    },
    stepButtonPressed: {
      opacity: 0.8,
    },
    stepButtonText: {
      ...typography.h2,
      color: theme.colors.textPrimary,
    },
    helperText: {
      ...typography.caption,
      color: theme.colors.textSecondary,
      marginTop: spacing.xs,
    },
    errorText: {
      ...typography.caption,
      color: theme.colors.danger,
      marginTop: spacing.xs,
    },
  });
}