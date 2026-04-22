import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { useAppTheme, type AppTheme } from '@/providers/ThemeProvider';
import { radius } from '@/theme/spacing';

export function DisplayGuideOverlay(): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      <View style={styles.centerWrap}>
        <View style={styles.guideBox} />
      </View>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    centerWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    guideBox: {
      width: '82%',
      height: '28%',
      borderRadius: radius.xl,
      borderWidth: 2,
      borderColor: theme.colors.accent,
      backgroundColor: 'transparent',
    },
  });
}