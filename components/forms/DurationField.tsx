import React, { useCallback, useMemo } from 'react';
import {
    KeyboardTypeOptions,
    StyleProp,
    StyleSheet,
    Text,
    TextInput,
    View,
    ViewStyle,
} from 'react-native';

import { useAppTheme, type AppTheme } from '@/providers/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type DurationFieldProps = Readonly<{
  label: string;
  valueSeconds: number | null;
  onChange: (valueSeconds: number | null) => void;
  helperText?: string;
  errorText?: string;
  disabled?: boolean;
  showHours?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}>;

type DurationParts = Readonly<{
  hours: string;
  minutes: string;
  seconds: string;
}>;

function splitDuration(totalSeconds: number | null): DurationParts {
  if (totalSeconds === null || totalSeconds < 0 || Number.isNaN(totalSeconds)) {
    return {
      hours: '',
      minutes: '',
      seconds: '',
    };
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours: String(hours),
    minutes: String(minutes),
    seconds: String(seconds),
  };
}

function sanitizeNumericInput(input: string): string {
  return input.replace(/[^\d]/g, '');
}

function parseDurationFromParts(parts: DurationParts): number | null {
  const hours = parts.hours === '' ? 0 : Number(parts.hours);
  const minutes = parts.minutes === '' ? 0 : Number(parts.minutes);
  const seconds = parts.seconds === '' ? 0 : Number(parts.seconds);

  if ([hours, minutes, seconds].some(value => Number.isNaN(value))) {
    return null;
  }

  const safeMinutes = Math.min(minutes, 59);
  const safeSeconds = Math.min(seconds, 59);

  if (hours === 0 && safeMinutes === 0 && safeSeconds === 0) {
    return null;
  }

  return hours * 3600 + safeMinutes * 60 + safeSeconds;
}

export function DurationField({
  label,
  valueSeconds,
  onChange,
  helperText,
  errorText,
  disabled = false,
  showHours = true,
  testID,
  style,
}: DurationFieldProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const parts = splitDuration(valueSeconds);
  const hasError = Boolean(errorText);
  const keyboardType: KeyboardTypeOptions = 'number-pad';

  const handlePartChange = useCallback(
    (key: keyof DurationParts, rawText: string) => {
      const text = sanitizeNumericInput(rawText);

      const nextParts: DurationParts = {
        ...parts,
        [key]: text,
      };

      const nextValue = parseDurationFromParts(nextParts);
      onChange(nextValue);
    },
    [onChange, parts],
  );

  return (
    <View style={style}>
      <Text style={styles.label}>{label}</Text>

      <View
        style={[
          styles.root,
          hasError && styles.rootError,
          disabled && styles.rootDisabled,
        ]}
      >
        {showHours ? (
          <>
            <DurationCell
              disabled={disabled}
              keyboardType={keyboardType}
              label="HH"
              onChangeText={text => handlePartChange('hours', text)}
              styles={styles}
              testID={testID ? `${testID}-hours` : undefined}
              value={parts.hours}
            />
            <Text style={styles.separator}>:</Text>
          </>
        ) : null}

        <DurationCell
          disabled={disabled}
          keyboardType={keyboardType}
          label="MM"
          onChangeText={text => handlePartChange('minutes', text)}
          styles={styles}
          testID={testID ? `${testID}-minutes` : undefined}
          value={parts.minutes}
        />

        <Text style={styles.separator}>:</Text>

        <DurationCell
          disabled={disabled}
          keyboardType={keyboardType}
          label="SS"
          onChangeText={text => handlePartChange('seconds', text)}
          styles={styles}
          testID={testID ? `${testID}-seconds` : undefined}
          value={parts.seconds}
        />
      </View>

      {errorText ? (
        <Text style={styles.errorText}>{errorText}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

type DurationCellProps = Readonly<{
  value: string;
  label: string;
  onChangeText: (text: string) => void;
  keyboardType: KeyboardTypeOptions;
  disabled: boolean;
  testID?: string;
  styles: ReturnType<typeof createStyles>;
}>;

function DurationCell({
  value,
  label,
  onChangeText,
  keyboardType,
  disabled,
  testID,
  styles,
}: DurationCellProps): React.JSX.Element {
  return (
    <View style={styles.cell}>
      <TextInput
        editable={!disabled}
        keyboardType={keyboardType}
        maxLength={3}
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor={styles.__themeTextSecondary}
        style={styles.input}
        testID={testID}
        value={value}
      />
      <Text style={styles.cellLabel}>{label}</Text>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  const styles = StyleSheet.create({
    label: {
      ...typography.bodyStrong,
      color: theme.colors.textPrimary,
      marginBottom: spacing.xs,
    },
    root: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      gap: spacing.xs,
    },
    rootError: {
      borderColor: theme.colors.danger,
    },
    rootDisabled: {
      opacity: 0.6,
    },
    cell: {
      minWidth: 68,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xs,
    },
    input: {
      minWidth: 48,
      textAlign: 'center',
      color: theme.colors.textPrimary,
      ...typography.h2,
      paddingVertical: spacing.xs,
    },
    cellLabel: {
      ...typography.caption,
      color: theme.colors.textSecondary,
      marginTop: spacing.xxs,
    },
    separator: {
      ...typography.h2,
      color: theme.colors.textSecondary,
      marginBottom: 14,
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

    // internal helper token for placeholder access
    __themeTextSecondary: theme.colors.textSecondary as never,
  });

  return styles;
}