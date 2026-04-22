import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { DisplayGuideOverlay } from '@/features/scan/components/DisplayGuideOverlay';
import { useAppTheme, type AppTheme } from '@/providers/ThemeProvider';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type CameraPreviewProps = Readonly<{
  ready: boolean;
}>;

export function CameraPreview({
  ready,
}: CameraPreviewProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  return (
    <AppCard padded={false} style={styles.root}>
      <View style={styles.previewArea}>
        <Text style={styles.previewText}>
          {ready
            ? 'Camera preview placeholder'
            : 'Camera is not ready yet'}
        </Text>
        <DisplayGuideOverlay />
      </View>
    </AppCard>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    root: {
      overflow: 'hidden',
    },
    previewArea: {
      height: 320,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceMuted,
    },
    previewText: {
      ...typography.body,
      color: theme.colors.textSecondary,
      marginBottom: spacing.sm,
    },
  });
}