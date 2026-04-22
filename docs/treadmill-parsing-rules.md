# Treadmill Parsing Rules

## Purpose

The treadmill parser extracts workout metrics from noisy OCR text produced from treadmill display captures.

## Target fields

- Time
- Distance
- Calories
- Speed
- Incline

## General parsing approach

1. Normalize OCR text
2. Split into lines
3. Match likely field labels and aliases
4. Extract value candidates from the same line
5. Parse and normalize value
6. Validate value range
7. Score confidence and emit warnings

## Common OCR issues handled

### Character substitutions

Known substitutions:
- `O` -> `0`
- `1`, `I`, `l` confusion in field labels
- `.` used instead of `:`
- `,` used instead of `.`

### LED display artifacts

Common effects:
- broken segments
- partial field labels
- merged tokens
- weak spacing

## Field alias examples

### Time
- `TIME`
- `T1ME`
- `TlME`
- `DURATION`
- `ELAPSED`

### Distance
- `DIST`
- `DISTANCE`
- `DlST`
- `DST`
- `KM`
- `MI`

### Calories
- `CAL`
- `CALORIES`
- `KCAL`
- `CALS`

### Speed
- `SPEED`
- `SPD`
- `PACE`
- `KPH`
- `KM/H`

### Incline
- `INCL`
- `INCLINE`
- `INC`
- `GRADE`
- `SLOPE`

## Validation rules

### Time
- greater than 0
- less than or equal to 24 hours

### Distance
- 0 to 100 km

### Calories
- 0 to 5000 kcal

### Speed
- 0 to 40 kph

### Incline
- 0 to 30 percent

## Cross-field consistency

When available:
- time + distance + speed should roughly agree
- implausible combinations reduce confidence
- high incline values are allowed but penalized if unusually large

## Confidence scoring

Confidence is based on:
- whether the field was found
- whether the value parsed successfully
- whether it came from a labeled line
- whether warnings were emitted
- overall parser warning count

Confidence is not used to silently discard data. It is used to guide review behavior.

## Review-first rule

Even when confidence is high:
- parsed fields remain editable
- save is user-confirmed
- warnings remain visible

The parser is allowed to be useful. It is not allowed to be arrogant.