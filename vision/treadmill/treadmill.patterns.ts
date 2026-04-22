export type TreadmillFieldPattern = Readonly<{
  label: string;
  aliases: RegExp[];
  value: RegExp;
}>;

const VALUE_NUMBER = String.raw`([0-9]+(?:\.[0-9]+)?)`;
const VALUE_TIME = String.raw`([0-9]{1,2}[:.][0-9]{2}(?:[:.][0-9]{2})?)`;

function makeAliasPatterns(aliases: string[]): RegExp[] {
  return aliases.map(alias => new RegExp(alias, 'i'));
}

export const treadmillPatterns = Object.freeze({
  time: {
    label: 'Time',
    aliases: makeAliasPatterns([
      String.raw`\bTIME\b`,
      String.raw`\bT1ME\b`,
      String.raw`\bTlME\b`,
      String.raw`\bDURATION\b`,
      String.raw`\bELAPSED\b`,
      String.raw`\bTMR\b`,
    ]),
    value: new RegExp(VALUE_TIME, 'i'),
  },
  distance: {
    label: 'Distance',
    aliases: makeAliasPatterns([
      String.raw`\bDIST(?:ANCE)?\b`,
      String.raw`\bDlST(?:ANCE)?\b`,
      String.raw`\bDST\b`,
      String.raw`\bKM\b`,
      String.raw`\bMl\b`,
      String.raw`\bMI\b`,
    ]),
    value: new RegExp(VALUE_NUMBER, 'i'),
  },
  calories: {
    label: 'Calories',
    aliases: makeAliasPatterns([
      String.raw`\bCAL(?:ORIES)?\b`,
      String.raw`\bCA[L1I]\b`,
      String.raw`\bKCAL\b`,
      String.raw`\bCALS\b`,
    ]),
    value: new RegExp(VALUE_NUMBER, 'i'),
  },
  speed: {
    label: 'Speed',
    aliases: makeAliasPatterns([
      String.raw`\bSPEED\b`,
      String.raw`\bSPD\b`,
      String.raw`\bPACE\b`,
      String.raw`\bKPH\b`,
      String.raw`\bKM/H\b`,
    ]),
    value: new RegExp(VALUE_NUMBER, 'i'),
  },
  incline: {
    label: 'Incline',
    aliases: makeAliasPatterns([
      String.raw`\bINCL(?:INE)?\b`,
      String.raw`\bINC\b`,
      String.raw`\bGRADE\b`,
      String.raw`\bSLOPE\b`,
      String.raw`\b% ?INCL\b`,
    ]),
    value: new RegExp(VALUE_NUMBER, 'i'),
  },
}) satisfies Record<string, TreadmillFieldPattern>;

export function looksLikeTimeToken(token: string): boolean {
  return /^[0-9]{1,2}[:.][0-9]{2}(?:[:.][0-9]{2})?$/.test(token);
}

export function looksLikeNumericToken(token: string): boolean {
  return /^[0-9]+(?:\.[0-9]+)?$/.test(token);
}