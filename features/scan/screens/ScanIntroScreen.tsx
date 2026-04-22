import { useNavigation } from '@react-navigation/native';
import React from 'react';

import { AppButton } from '@/components/common/AppButton';
import { AppHeader } from '@/components/common/AppHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { Screen } from '@/components/common/Screen';
import { scanActions } from '@/features/scan/state/scan.actions';
import type { ScanStackScreenProps } from '@/navigation/routeTypes';
import { SCAN_ROUTES } from '@/navigation/routeTypes';

export function ScanIntroScreen(): React.JSX.Element {
  const navigation = useNavigation<ScanStackScreenProps<'ScanHome'>['navigation']>();

  return (
    <Screen scrollable centered>
      <AppHeader
        title="Treadmill Scan"
        subtitle="Capture the treadmill display, review parsed values, and save safely to your workout log."
      />

      <EmptyState
        title="Fast single-capture flow"
        description="This scan flow focuses on reliability first: capture one display image, parse the fields, review them, and save only after you confirm."
      />

      <AppButton
        label="Start Scan"
        onPress={() => {
          scanActions.beginSession();
          navigation.navigate(SCAN_ROUTES.TREADMILL_SCAN);
        }}
        fullWidth
      />
    </Screen>
  );
}