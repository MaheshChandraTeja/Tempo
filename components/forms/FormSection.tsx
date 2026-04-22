import React, { PropsWithChildren, useMemo } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { Divider } from '@/components/common/Divider';
import { useAppTheme, type AppTheme } from '@/providers/ThemeProvider';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type FormSectionProps = PropsWithChildren<{
  title: string;
  description?: string;
  footer?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentSpacing?: number;
}>;

export function FormSection({
  title,
  description,
  footer,
  style,
  contentSpacing = spacing.md,
  children,
}: FormSectionProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useMemo(
    () => createStyles(theme, contentSpacing),
    [theme, contentSpacing],
  );

  return (
    <AppCard style={style}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>

      <Divider spacingVertical={spacing.md} />

      <View style={styles.content}>{children}</View>

      {footer ? (
        <>
          <Divider spacingVertical={spacing.md} />
          <View>{footer}</View>
        </>
      ) : null}
    </AppCard>
  );
}

function createStyles(theme: AppTheme, contentSpacing: number) {
  return StyleSheet.create({
    header: {
      gap: spacing.xs,
    },
    title: {
      ...typography.h2,
      color: theme.colors.textPrimary,
    },
    description: {
      ...typography.body,
      color: theme.colors.textSecondary,
    },
    content: {
      gap: contentSpacing,
    },
  });
}