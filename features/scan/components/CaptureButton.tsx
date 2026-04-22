import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { withOpacity } from '@/theme/colorUtils';
import { useAppTheme, type AppTheme } from '@/providers/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type CaptureButtonProps = Readonly<{
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
  hint?: string;
}>;

export function CaptureButton({
  onPress,
  loading = false,
  disabled = false,
  label = 'Capture Display',
  hint = 'Capture a single front-facing frame of the treadmill console.',
}: CaptureButtonProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.root}>
      <AppButton
        label={label}
        onPress={onPress}
        loading={loading}
        disabled={disabled}
        fullWidth
        size="lg"
      />

      <View style={styles.hintRow}>
        <View style={styles.iconWrap}>
          <MaterialIcons name="bolt" size={14} color={theme.colors.accent} />
        </View>
        <Text style={styles.hint}>{hint}</Text>
      </View>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    root: {
      gap: spacing.md,
    },
    hintRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
      padding: spacing.sm,
      borderRadius: radius.lg,
      backgroundColor: withOpacity(theme.colors.surfaceMuted, theme.isDark ? 0.68 : 0.82),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: withOpacity(theme.colors.border, 0.78),
    },
    iconWrap: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: withOpacity(theme.colors.accent, theme.isDark ? 0.16 : 0.12),
    },
    hint: {
      ...typography.caption,
      color: theme.colors.textSecondary,
      flex: 1,
      lineHeight: 20,
    },
  });
}
