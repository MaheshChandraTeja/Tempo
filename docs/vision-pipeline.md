# Vision Pipeline

## Purpose

The vision pipeline converts a treadmill display capture into structured workout metrics suitable for review and save.

## Stages

### 1. Capture

Input sources supported by design:
- still photo file
- image URI
- frame-based input later

Current v1 priority:
- single capture
- reliability over flashy realtime behavior

### 2. OCR

OCR layer responsibilities:
- accept image input
- run engine-specific recognition
- return a stable raw result shape
- normalize text and token output
- surface warnings without crashing downstream stages

Files:
- `vision/ocr/ocr.types.ts`
- `vision/ocr/ocr.adapter.ts`
- `vision/ocr/ocr.normalize.ts`
- `vision/ocr/ocr.debug.ts`

### 3. Treadmill parsing

Parser responsibilities:
- locate known treadmill fields
- tolerate LED/OCR mistakes
- validate extracted values
- compute parser confidence
- return structured warnings

Files:
- `vision/treadmill/treadmill.parser.ts`
- `vision/treadmill/treadmill.patterns.ts`
- `vision/treadmill/treadmill.validators.ts`
- `vision/treadmill/treadmill.postprocess.ts`
- `vision/treadmill/treadmill.confidence.ts`

### 4. Orchestration

Pipeline orchestration responsibilities:
- run stages in order
- track timing metrics
- return a stable success/error result
- preserve debug context

Files:
- `vision/pipeline/scan.pipeline.ts`
- `vision/pipeline/singleCapture.pipeline.ts`
- `vision/pipeline/realtimeAssist.pipeline.ts`
- `vision/pipeline/pipeline.metrics.ts`

## Result contract

Successful scan output should include:
- parsed metrics
- overall confidence
- stage timing
- warnings
- normalized OCR text

The UI review screen must never assume the OCR was perfect. Because it won’t be. LED displays are not known for emotional maturity.

## Failure model

Expected failure classes:
- invalid source input
- OCR engine unavailable
- recognition returned weak or partial text
- missing treadmill fields
- inconsistent derived values

Pipeline behavior:
- fail loudly in structure
- fail softly in UI
- never save automatically from weak parse output without review

## ROI and native boundary

Frame-processor and ROI helpers live separately from business parsing.

Files:
- `vision/native/frameProcessorBridge.ts`
- `vision/native/nativeOcrPlugin.ts`
- `vision/native/roiCropping.ts`

This keeps:
- native/plugin churn isolated
- ROI logic reusable
- parsing logic independent from camera implementation details

## Logging and diagnostics

Keep debug artifacts lightweight:
- normalized OCR text
- parser warnings
- confidence score
- stage timings
- optional raw debug payload

Avoid:
- logging sensitive user data indiscriminately
- burying business decisions inside native code
- coupling parser logic to specific OCR vendor response shapes

## Future direction

Planned later extensions:
- confidence-guided assist overlays
- multi-frame scan stabilization
- ROI refinement
- provider-specific OCR adapters
- restoreable scan debug sessions