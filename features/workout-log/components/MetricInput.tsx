import React from 'react';

import { DurationField } from '@/components/forms/DurationField';
import { NumberField } from '@/components/forms/NumberField';

type MetricInputProps = Readonly<
  | {
      kind: 'duration';
      label: string;
      value: number | null;
      onChange: (value: number | null) => void;
      helperText?: string;
      errorText?: string;
      disabled?: boolean;
      showHours?: boolean;
    }
  | {
      kind: 'number';
      label: string;
      value: number | null;
      onChange: (value: number | null) => void;
      helperText?: string;
      errorText?: string;
      disabled?: boolean;
      placeholder?: string;
      unitLabel?: string;
      min?: number;
      max?: number;
      step?: number;
      decimals?: number;
      allowNegative?: boolean;
    }
>;

export function MetricInput(props: MetricInputProps): React.JSX.Element {
  if (props.kind === 'duration') {
    return (
      <DurationField
        label={props.label}
        valueSeconds={props.value}
        onChange={props.onChange}
        helperText={props.helperText}
        errorText={props.errorText}
        disabled={props.disabled}
        showHours={props.showHours}
      />
    );
  }

  return (
    <NumberField
      label={props.label}
      value={props.value}
      onChange={props.onChange}
      helperText={props.helperText}
      errorText={props.errorText}
      disabled={props.disabled}
      placeholder={props.placeholder}
      unitLabel={props.unitLabel}
      min={props.min}
      max={props.max}
      step={props.step}
      decimals={props.decimals}
      allowNegative={props.allowNegative}
    />
  );
}