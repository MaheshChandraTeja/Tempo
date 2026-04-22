# 🚀 Tempo

### Local-first Treadmill OCR • On-device Vision • Private Fitness Logging

![Platform](https://img.shields.io/badge/platform-React%20Native-black) ![Architecture](https://img.shields.io/badge/architecture-local--first-black) ![Vision](https://img.shields.io/badge/vision-on--device%20ML-black) ![Privacy](https://img.shields.io/badge/privacy-no%20cloud-black) ![Focus](https://img.shields.io/badge/focus-health%20logging%20%2B%20real--world%20capture-black)

Tempo turns treadmill display chaos into clean, trusted workout logs — fast. Use your phone camera, let on-device vision extract the numbers, review the parsed values, and save everything locally. No cloud, no accounts, no fuss.

---

## Table of contents

- About Tempo
- Why it matters
- Highlights
- How it works (high level)
- Features
- Technical pipeline
- Example scan
- Getting started
- Developer notes (models & tests)
- Contributing
- Authors & Organization
- Privacy & Data
- License

---

## About Tempo

Tempo is a cross-platform mobile app that makes exercise logging effortless by using on-device OCR to read treadmill displays and convert visual numbers into structured workout records. The product is designed as a systems-first project: every piece of the pipeline (capture, OCR, normalization, parsing, validation) is engineered for messy, real-world conditions.

Tempo sits at the intersection of:
- mobile engineering
- human-computer interaction
- on-device machine learning
- offline-first product design
- robust, testable data pipelines

---

## Why it matters

Many everyday devices still only expose information on a physical display. People resort to manual typing to archive those numbers — an easy path to abandonment. Tempo removes the highest-friction part of exercise logging by turning a quick photo into a validated, local workout entry.

---

## Highlights

- Guided camera overlay for consistent captures
- On-device OCR — no cloud dependency for recognition
- Robust normalization to handle LED/segment-display quirks
- Review-first UX: machine suggestions are editable before save
- Local-first storage with portable exports (JSON/CSV)
- Debug artifacts preserved locally to improve reliability

---

## How it works (short)

1. Aim the camera at the treadmill display with the overlay.
2. On-device OCR extracts raw text and bounding boxes.
3. Normalization + parsing convert messy tokens into typed fields.
4. Validation flags implausible values.
5. User quickly reviews and saves the workout to local storage.

---

## Features (detailed)

- Workout logging: create and manage workouts with metadata (duration, calories, distance, speed, incline, notes, workout type).
- Treadmill display scanning: capture, extract, and map display numbers to fields automatically.
- OCR normalization: correct common OCR confusions (O ↦ 0, S ↦ 5, l/I ↦ 1) and segment-display artifacts.
- Parsing & validation: grammar-driven and probabilistic parsing with range checks and cross-field consistency rules.
- Local-first persistence: no mandatory accounts, explicit export/delete, and optional local scan artifact retention for debugging.
- History & insights: daily history, weekly trends, totals, and streak summaries from local data.
- Manual entry: full manual fallback and edit capabilities.
- Developer-friendly: preserve scan metadata for dataset building and reproducible tests.

---

## Technical pipeline (engineered for reality)

Tempo is built as a staged pipeline so each step is auditable and testable:

1. Capture — guided overlay, quick single-frame capture, and minimal preprocessing.
2. OCR — mobile-optimized on-device text recognition returns lines, confidence scores, and bounding boxes.
3. Normalization — rule-based + heuristics to fix typical LED/segment errors.
4. Parsing — map normalized tokens into typed fields (time, distance, calories, speed, incline) using grammar and ranked candidate scoring.
5. Validation — numeric sanity checks, unit inference, and cross-field consistency (e.g., distance vs duration/speed plausibility).
6. Review — editable form with source image and annotated OCR overlay for fast human confirmation.
7. Persist — structured workout saved locally with optional artifacts for audits or exports.

This division keeps Tempo robust under glare, occlusion, low light, and nonstandard fonts.

---

## Example scan

Human-readable display:
- Time: `32:14`
- Distance: `4.10`
- Calories: `286`
- Speed: `7.5`
- Incline: `2.0`

Noisy OCR output:
```
TlME 32:14
DlST 4.1O
CAL 28G
SPD 7.S
lNC 2.O
```

Tempo normalizes those tokens (O→0, S→5, G→6 where appropriate), parses them into typed fields, validates ranges, and presents the result in an editable review screen before saving.

---

## Getting started (developer & user)

Prereqs: Node.js, npm, React Native toolchain (Android/iOS), and device/emulator.

1. Clone
   git clone https://github.com/MaheshChandraTeja/Tempo.git
   cd Tempo

2. Install
   npm install

3. Run (development)
   npm start

4. Build
   Follow React Native docs for platform-specific builds.

Notes:
- On-device OCR/model files may require additional setup. See Developer notes below if models are external or need placement.
- Local exports to JSON/CSV are available from the history screen.

---

## Developer notes (models, tests, and data)

- Models: Mobile-optimized OCR and any lightweight on-device models should be tracked in `docs/models.md` or a top-level `models` directory; if model binaries are large, include download instructions rather than storing them in the repo.
- Tests: Add unit tests for normalization rules and parsing grammar. Include a small set of representative capture images under `test/fixtures` to prevent regressions.
- Benchmarks: Capture/parse latency and energy profiles are important; include CPU/time metrics for common devices.
- Artifacts: Store optional scan artifacts (annotated images, raw OCR tokens, parse traces) with each saved workout to accelerate debugging and dataset construction.

---

## Contributing

We welcome contributions that improve real-world reliability:

- Clear bug reports with reproduction steps and sample images
- Unit and integration tests for parsing/normalization edge cases
- Performance improvements for capture/parse latency
- UX improvements for the review flow
- New normalization heuristics or parser rules

Suggested workflow:
1. Fork
2. Create a feature branch
3. Add tests and clear commit messages
4. Open a Pull Request with a concise description and sample inputs/screenshots

Label OCR failures with example images — they help triage and fix parsing heuristics quickly.

---

## Authors

- Mahesh Chandra Teja Garnepudi (@MaheshChandraTeja)
- Sagarika Srivastava (@SagarikaSrivastava)

Organization: Kairais Tech — https://www.kairais.com

---

## Privacy & Data

Tempo is designed to keep user data local by default:
- No mandatory accounts or background cloud OCR
- Local persistence with explicit export and delete controls
- Users can export data to JSON/CSV for portability

---

## License

Tempo is proprietary software. Third-party dependencies are used under their own licenses and are respected accordingly.

---