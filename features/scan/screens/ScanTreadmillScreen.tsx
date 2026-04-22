import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { AppHeader } from '@/components/common/AppHeader';
import { LoadingView } from '@/components/common/LoadingView';
import { Screen } from '@/components/common/Screen';
import { CameraPreview } from '@/features/scan/components/CameraPreview';
import { CaptureButton } from '@/features/scan/components/CaptureButton';
import { scanActions } from '@/features/scan/state/scan.actions';
import type { ScanStackScreenProps } from '@/navigation/routeTypes';
import { SCAN_ROUTES } from '@/navigation/routeTypes';

const demoPhoto = {
  path: 'demo-treadmill-capture.jpg',
  width: 1920,
  height: 1080,
  isRawPhoto: false,
  orientation: 'portrait' as const,
  isMirrored: false,
  metadata: {},
  thumbnailPath: undefined,
};

export function ScanTreadmillScreen(): React.JSX.Element {
  const navigation = useNavigation<ScanStackScreenProps<'TreadmillScan'>['navigation']>();
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = async () => {
    setIsCapturing(true);

    try {
      const ok = await scanActions.runSingleCapture(demoPhoto);

      if (!ok) {
        Alert.alert('Scan failed', 'The treadmill scan could not be processed.');
        return;
      }

      navigation.navigate(SCAN_ROUTES.SCAN_REVIEW, {
        scanId: 'current-session',
      });
    } finally {
      setIsCapturing(false);
    }
  };

  if (isCapturing) {
    return <LoadingView label="Capturing and processing display..." />;
  }

  return (
    <Screen scrollable>
      <AppHeader
        title="Scan Display"
        subtitle="Align the treadmill console inside the guide area and capture a single still image."
      />

      <CameraPreview ready />

      <AppCard>
        <CaptureButton onPress={handleCapture} />
      </AppCard>
    </Screen>
  );
}