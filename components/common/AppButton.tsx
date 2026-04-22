import React, { useMemo } from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    ViewStyle,
} from 'react-native';

import { useAppTheme } from '@/providers/ThemeProvider';
import { layout, radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export type AppButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type AppButtonSize = 'sm' | 'md' | 'lg';

type AppButtonProps = Readonly<{
  label: string;
  onPress?: () => void;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
}>;

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  style,
  accessibilityLabel,
  testID,
}: AppButtonProps): React.JSX.Element {
  const { theme } = useAppTheme();

  const styles = useMemo(
    () => createStyles(theme.colors.accent, theme.colors),
    [theme.colors],
  );

  const isDisabled = disabled || loading;

  const containerStyle = [
    styles.base,
    styles[size],
    fullWidth && styles.fullWidth,
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'ghost' && styles.ghost,
    variant === 'danger' && styles.danger,
    isDisabled && styles.disabled,
    style,
  ];

  const labelStyle = [
    styles.label,
    variant === 'primary' && styles.primaryLabel,
    variant === 'secondary' && styles.secondaryLabel,
    variant === 'ghost' && styles.ghostLabel,
    variant === 'danger' && styles.dangerLabel,
    isDisabled && styles.disabledLabel,
  ];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        containerStyle,
        pressed && !isDisabled ? styles.pressed : undefined,
      ]}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger'
            ? '#FFFFFF'
            : theme.colors.textPrimary}
          size="small"
        />
      ) : (
        <Text style={labelStyle}>{label}</Text>
      )}
    </Pressable>
  );
}

function createStyles(accent: string, colors: ReturnType<typeof useAppTheme>['theme']['colors']) {
  return StyleSheet.create({
    base: {
      minHeight: layout.minTouchTarget,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },
    sm: {
      minHeight: 40,
      paddingVertical: spacing.xs,
    },
    md: {
      minHeight: layout.minTouchTarget,
      paddingVertical: spacing.sm,
    },
    lg: {
      minHeight: 52,
      paddingVertical: spacing.md,
    },
    fullWidth: {
      width: '100%',
    },
    primary: {
      backgroundColor: accent,
      borderColor: accent,
    },
    secondary: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
    },
    danger: {
      backgroundColor: colors.danger,
      borderColor: colors.danger,
    },
    disabled: {
      opacity: 0.55,
    },
    pressed: {
      opacity: 0.85,
      transform: [{ scale: 0.99 }],
    },
    label: {
      ...typography.button,
      textAlign: 'center',
    },
    primaryLabel: {
      color: '#FFFFFF',
    },
    secondaryLabel: {
      color: colors.textPrimary,
    },
    ghostLabel: {
      color: colors.textPrimary,
    },
    dangerLabel: {
      color: '#FFFFFF',
    },
    disabledLabel: {
      color: colors.textSecondary,
    },
  });
}