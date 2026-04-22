import { safeTrim } from '@/utils/strings/safeTrim';

export type NormalizeOcrTextOptions = Readonly<{
  uppercase?: boolean;
  preserveLineBreaks?: boolean;
}>;

const OCR_SUBSTITUTIONS: ReadonlyArray<readonly [RegExp, string]> = [
  [/[|]/g, '1'],
  [/[“”]/g, '"'],
  [/[‘’]/g, "'"],
  [/[‐-‒–—]/g, '-'],
  [/[Oo](?=\d)/g, '0'],
  [/(?<=\d)[Oo]/g, '0'],
  [/[Ss](?=\d)/g, '5'],
  [/(?<=\d)[IiLl]/g, '1'],
];

export function normalizeOcrText(
  input: string | null | undefined,
  options: NormalizeOcrTextOptions = {},
): string {
  const {
    uppercase = false,
    preserveLineBreaks = false,
  } = options;

  let text = safeTrim(input);

  if (text.length === 0) {
    return '';
  }

  text = text.normalize('NFKC');

  for (const [pattern, replacement] of OCR_SUBSTITUTIONS) {
    text = text.replace(pattern, replacement);
  }

  if (preserveLineBreaks) {
    text = text
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .split('\n')
      .map(line => line.trim())
      .join('\n');
  } else {
    text = text.replace(/\s+/g, ' ').trim();
  }

  return uppercase ? text.toUpperCase() : text;
}