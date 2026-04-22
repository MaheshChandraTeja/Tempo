import React from 'react';

import { AppButton } from '@/components/common/AppButton';

type CaptureButtonProps = Readonly<{
  onPress: () => void;
  loading?: boolean;
}>;

export function CaptureButton({
  onPress,
  loading = false,
}: CaptureButtonProps): React.JSX.Element {
  return (
    <AppButton
      label="Capture Display"
      onPress={onPress}
      loading={loading}
      fullWidth
    />
  );
}