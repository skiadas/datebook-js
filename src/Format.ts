import { DatebookEntry } from './DatebookEntry';

const regex = /%\{(.*?)\}|%([^{}])/g;
const pr = new Intl.PluralRules('en-US', { type: 'ordinal' });
const suffixes = new Map([
  ['one', 'st'],
  ['two', 'nd'],
  ['few', 'rd'],
  ['other', 'th'],
]);

export const defaultFormatString = '%{yyyy-MM-dd}';
/**
 * Format a {@link DatebookEntry | Datebook entry} according to the specified format string.
 *
 * @remarks The format used is as follows:
 * - Any `%{...}` part is interpreted using {@link https://moment.github.io/luxon/api-docs/index.html#datetimetoformat | Luxon's toFormat}
 * - `%d` is the day-count number. `%D` is that number along with the "ordinal indicator",
 *    e.g. 1st, 2nd etc
 * - `%w` is the week-count. `%W` is that count as an ordinal indicator
 * - `%%` is treated as a literal percent sign
 * - All other characters are treated as is
 * @param dbe - the datebook entry
 * @param formatString - the format string that follows the description above
 * @public
 */
export function format(dbe: DatebookEntry, formatString: string): string {
  return formatString.replaceAll(regex, (p, m1, m2) => {
    if (m1 != undefined) {
      return dbe.datetime.toFormat(m1);
    }
    // Our own conventions here
    switch (m2) {
      case 'd':
        return `${dbe.daycount}`;
      case 'D':
        return ordinalize(dbe.daycount);
      case 'w':
        return `${dbe.weekcount}`;
      case 'W':
        return ordinalize(dbe.weekcount);
      case '%':
        return '%';
    }
    return p;
  });
}

function ordinalize(n: number): string {
  const rule = pr.select(n);
  const suffix = suffixes.get(rule);
  return `${n}${suffix}`;
}
