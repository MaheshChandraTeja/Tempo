import { Stack } from 'expo-router';
import React from 'react';

import { PermissionsProvider } from '@/providers/PermissionsProvider';
import { StoreProvider } from '@/providers/StoreProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';

export default function RootLayout(): React.JSX.Element {
  return (
    <ThemeProvider>
      <StoreProvider>
        <PermissionsProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
          </Stack>
        </PermissionsProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}