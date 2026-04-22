import React, { PropsWithChildren, useMemo } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleProp,
    StyleSheet,
    View,
    ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/providers/ThemeProvider';
import { layout, spacing } from '@/theme/spacing';

type ScreenProps = PropsWithChildren<{
  scrollable?: boolean;
  centered?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  safeAreaEdges?: Array<'top' | 'right' | 'bottom' | 'left'>;
}>;

export function Screen({
  children,
  scrollable = false,
  centered = false,
  contentStyle,
  safeAreaEdges = ['top', 'right', 'bottom', 'left'],
}: ScreenProps): React.JSX.Element {
  const { theme } = useAppTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safeArea: {
          flex: 1,
          backgroundColor: theme.colors.background,
        },
        keyboard: {
          flex: 1,
        },
        container: {
          flex: 1,
          backgroundColor: theme.colors.background,
        },
        content: {
          flexGrow: 1,
          paddingHorizontal: layout.screenHorizontalPadding,
          paddingVertical: layout.screenVerticalPadding,
          width: '100%',
          alignSelf: 'center',
          maxWidth: layout.contentMaxWidth,
        },
        centered: {
          alignItems: 'center',
          justifyContent: 'center',
        },
        inner: {
          width: '100%',
          gap: spacing.md,
        },
      }),
    [theme.colors.background],
  );

  const sharedContentStyle = [
    styles.content,
    centered && styles.centered,
    contentStyle,
  ];

  return (
    <SafeAreaView edges={safeAreaEdges} style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scrollable ? (
          <ScrollView
            style={styles.container}
            contentContainerStyle={sharedContentStyle}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.inner}>{children}</View>
          </ScrollView>
        ) : (
          <View style={styles.container}>
            <View style={sharedContentStyle}>
              <View style={styles.inner}>{children}</View>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}