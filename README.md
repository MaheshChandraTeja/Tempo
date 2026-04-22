# Tempo

### Local-First Calorie & Exercise Tracking with On-Device Vision

![Platform](https://img.shields.io/badge/platform-React%20Native-black)
![Architecture](https://img.shields.io/badge/architecture-local--first-black)
![Vision](https://img.shields.io/badge/vision-on--device%20ML-black)
![Privacy](https://img.shields.io/badge/privacy-no%20cloud-black)
![Focus](https://img.shields.io/badge/focus-health%20logging%20%2B%20real--world%20capture-black)

Tempo is a cross-platform fitness tracking application built around a simple idea:

**logging exercise should not feel like clerical work.**

Most exercise apps are good at dashboards, goals, and visual polish, but they still assume the user will manually retype what a machine already shows. Tempo explores a more practical interaction model: use on-device vision to read workout metrics directly from the treadmill display, then convert that raw visual signal into structured exercise logs the user can review and save locally.

The project is intentionally designed as a **local-first system**. All core functionality, including OCR-driven treadmill parsing, is meant to run on-device without a backend dependency. That makes the product faster, more private, and more reliable in low-connectivity settings, while also turning it into a more interesting engineering problem than yet another CRUD tracker with motivational gradients.

* * *

## Why Tempo

Exercise tracking sounds simple until you look at where friction actually lives.

People do not usually stop tracking because they hate data. They stop because the process is repetitive:

- unlock phone
- open app
- create new workout
- type time
- type calories
- type distance
- fix a typo
- save

That loop is tiny, but repeated often enough it becomes abandonment by a thousand taps.

Tempo is built around the idea that **computer vision can remove the highest-friction part of consumer fitness logging** without requiring wearables, expensive integrations, or cloud processing. Instead of asking the user to re-enter treadmill metrics manually, the app captures the machine display, extracts the visible values, validates them, and offers a fast review flow before saving.

This makes Tempo not just a health app, but a systems project at the intersection of:

- mobile engineering
- human-computer interaction
- on-device machine learning
- noisy text extraction
- offline-first product design
- trustworthy local data handling

* * *

## Research Motivation

Tempo is motivated by a broader technical question:

**How can mobile systems use on-device vision to turn messy, real-world interfaces into structured, user-owned data without relying on the cloud?**

That question matters well beyond fitness.

Many everyday devices still expose information only through physical displays rather than APIs. In gyms, medical devices, industrial environments, and low-connectivity settings, people often have to manually transfer values from screen to software. Tempo treats treadmill logging as a focused, real-world instance of a larger systems problem:

- how to capture information from imperfect visual input
- how to interpret OCR output from glare, LED noise, odd fonts, and partial occlusion
- how to validate extracted values before they become stored records
- how to keep the entire workflow private, local, and inspectable

The project therefore serves two purposes at once:

1. **A practical mobile application** for fitness users
2. **An engineering study** in local-first vision pipelines for structured data extraction

In that sense, Tempo is less about “AI for health” as a slogan and more about building a disciplined, reliable bridge between human environments and user-controlled software.

* * *

## What Tempo Does

### Daily Exercise Logging
- Create and manage workout entries by day
- Record duration, calories, distance, speed, incline, notes, and workout type
- Support manual entry for all exercise sessions
- Group logs into daily summaries and trends

### Treadmill Display Scanning
- Use the phone camera to capture treadmill metrics directly from the LED display
- Extract visible workout values such as:
  - time
  - distance
  - calories
  - speed
  - incline
- Parse noisy OCR text into structured workout data
- Present all extracted fields for user confirmation before saving

### Local-First Data Handling
- Store workout data entirely on-device
- Preserve scan metadata locally for debugging and validation
- Support export to portable formats such as JSON and CSV
- Avoid mandatory accounts, backend sync, or cloud OCR

### History and Trends
- View daily workout history
- See weekly trends and consistency over time
- Track total calories burned, distance, and exercise duration
- Build streak-style summaries from local workout history

* * *

## Core Design Principles

### 1. Local by Default
Tempo is designed to work offline. A user should be able to open the app, log a workout, scan a treadmill, review the extracted values, and save the result without any network dependency.

### 2. Vision is the Product, Not a Demo
The camera pipeline is not a decorative feature. It is the main interaction innovation in the app. That means the implementation must be engineered for real conditions rather than ideal screenshots.

### 3. OCR Output is Never Trusted Blindly
Machine-read values are always reviewed before save. Tempo treats OCR as assistive input, not ground truth.

### 4. Structured Data Matters
A good scan experience is not just “text was found.” It is “the right fields were extracted, validated, and converted into a useful log.”

### 5. Privacy is a Systems Property
Privacy here is not just a policy statement. It is reflected in architecture choices:
- no mandatory backend
- no cloud OCR dependency
- local persistence
- explicit export and delete flows

* * *

## Key Technical Ideas

Tempo is built around a multi-stage local pipeline:

1. **Capture**  
   The user aligns the treadmill display within a guided camera overlay.

2. **OCR**  
   On-device text recognition extracts visible text from the display.

3. **Normalization**  
   OCR output is cleaned to handle common LED-style errors such as:
   - `O` instead of `0`
   - `S` instead of `5`
   - `I` or `l` instead of `1`

4. **Parsing**  
   The normalized text is interpreted into treadmill-specific fields such as duration, calories, distance, speed, and incline.

5. **Validation**  
   Parsed values are checked against plausible workout ranges.

6. **Review and Save**  
   The user confirms or edits the extracted fields before the workout is stored locally.

This structure matters because the real challenge is not “read text from image.” The challenge is **convert unreliable raw text into trustworthy, structured workout data**.

* * *

## Example Scan Scenario

A treadmill may visually show:

- Time: `32:14`
- Distance: `4.10`
- Calories: `286`
- Speed: `7.5`
- Incline: `2.0`

But an OCR engine might return something closer to:

```text
TlME 32:14
DlST 4.1O
CAL 28G
SPD 7.S
lNC 2.O

## Contributing

Contributions are welcome:
- bug reports with reproduction steps
- test cases (especially edge cases)
- performance benchmarks
- receipt spec improvements

Suggested workflow:
1. Fork
2. Create a feature branch
3. Add tests where possible
4. Open a PR with a clear description

---

## 🏢 About

**Built by**  
**Mahesh Chandra Teja Garnepudi**  
**Sagarika Srivastava**

**Organization**  
**Kairais Tech**  
https://www.kairais.com

---

## 📄 License

ZeroTrace is proprietary software.  
Third‑party dependencies are licensed under their respective terms and used in compliance.