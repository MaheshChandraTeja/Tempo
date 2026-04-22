import type { RefObject } from 'react';
import type {
  CameraPhotoOutput,
  CameraRef,
  PhotoFile,
} from 'react-native-vision-camera';

import {
  captureStillPhoto,
  type CaptureStillPhotoOptions,
} from '@/vision/camera/camera.capture';
import type { ScanPipeline, ScanPipelineResult } from '@/vision/pipeline/scan.pipeline';

export type SingleCaptureInput =
  | Readonly<{
      kind: 'photo-file';
      photo: PhotoFile;
      captureDebugLabel?: string;
    }>
  | Readonly<{
      kind: 'camera-ref';
      cameraRef: RefObject<CameraRef | null | undefined>;
      photoOutput: CameraPhotoOutput;
      photoOptions?: CaptureStillPhotoOptions;
      captureDebugLabel?: string;
    }>;

export type SingleCapturePipeline = Readonly<{
  run: (input: SingleCaptureInput) => Promise<ScanPipelineResult>;
}>;

function photoFileToOcrSource(photo: PhotoFile) {
  return {
    kind: 'photo-file' as const,
    path: photo.filePath,
    mimeType: 'image/jpeg',
  };
}

function createScanPipelineInput(
  photo: PhotoFile,
  captureDebugLabel?: string,
) {
  const source = photoFileToOcrSource(photo);

  return captureDebugLabel == null
    ? { source }
    : { source, captureDebugLabel };
}

export function createSingleCapturePipeline(
  scanPipeline: ScanPipeline,
): SingleCapturePipeline {
  return Object.freeze({
    async run(input: SingleCaptureInput): Promise<ScanPipelineResult> {
      if (input.kind === 'photo-file') {
        return scanPipeline.run(
          createScanPipelineInput(input.photo, input.captureDebugLabel),
        );
      }

      const captureResult = await captureStillPhoto(
        {
          cameraRef: input.cameraRef,
          photoOutput: input.photoOutput,
        },
        input.photoOptions,
      );

      if (!captureResult.ok) {
        return {
          ok: false,
          source: null,
          error: captureResult.error,
          metrics: {
            startedAtMs: Date.now(),
            endedAtMs: Date.now(),
            totalDurationMs: 0,
            stages: [],
          },
        };
      }

      return scanPipeline.run(
        createScanPipelineInput(
          captureResult.photo,
          input.captureDebugLabel,
        ),
      );
    },
  });
}
