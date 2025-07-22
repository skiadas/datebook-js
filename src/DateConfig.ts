import { DateTime } from 'luxon';
import { DatebookEntry } from './DatebookEntry';

/** A simple type for the different weekdays
 * @public
 */
export type Weekday =
  | 'Sunday'
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday';

/**
 * Specifies which days to include in terms of a fixed pattern
 * @public
 */
export type FixedPattern = {
  /** A list of weekdays to include */
  readonly weekdays?: readonly Weekday[];
  /** Only include weekdays that are the n-th occurrences within that month */
  readonly nthInMonth?: readonly number[];
  /** Determines if any weeks should be skipped. The default of 1 skips no weeks */
  readonly everyNthWeek?: number;
};

/**
 * A function used to determine if a given {@link DatebookEntry} should be added to the list.
 *
 * @param curr - The entry under consideration
 * @param arr - The entries included so far
 * @returns Whether the entry should be included
 *
 * @public
 */
export type Tester = (curr: DatebookEntry, arr: readonly DatebookEntry[]) => boolean;
/**
 * Describes rules for picking dates. It can either be a {@link Tester} function
 * or a {@link FixedPattern} of rules.
 * @public
 */
export type Pattern = FixedPattern | Tester;

const isTrue: Tester = () => true;

export function matches(pattern: FixedPattern | Tester | undefined): Tester {
  if (pattern == undefined) return isTrue;
  if (typeof pattern == 'function') return pattern;
  const { weekdays, nthInMonth, everyNthWeek } = pattern;
  const weekdayTester: Tester = matchesWeekdays(weekdays);
  const nthInMonthTester: Tester = matchesNthInMonth(nthInMonth);
  const everyNthWeekTester: Tester = isEveryNthWeek(everyNthWeek);
  return (curr, arr) =>
    weekdayTester(curr, arr) && nthInMonthTester(curr, arr) && everyNthWeekTester(curr, arr);
}

function matchesNthInMonth(nthInMonth: readonly number[] | undefined): Tester {
  if (nthInMonth == undefined) return isTrue;
  return (curr) => isNthInMonth(curr.ymd, nthInMonth);
}

function isNthInMonth(ymd: readonly [number, number, number], nthInMonth: readonly number[]) {
  const [, , d] = ymd;
  const nth = Math.floor(d / 7) + 1;
  return nth in nthInMonth;
}

function matchesWeekdays(weekdays: readonly Weekday[] | undefined): Tester {
  if (weekdays == undefined) return isTrue;
  return (curr) => weekdays.includes(curr.weekday as Weekday);
}

function isEveryNthWeek(everyNthWeek: number | undefined): Tester {
  if (everyNthWeek == undefined) return isTrue;
  // Must make sure that the last similar entry, if any, is at correct interval
  return (curr, arr) => {
    const last = arr.findLast((db) => db.weekday == curr.weekday);
    if (last == undefined) return true;
    const weeksApart = curr.weekcount - last.weekcount;
    return weeksApart == everyNthWeek;
  };
}

/**
 * The configuration for which dates to include.
 *
 * @public
 */
export interface DateConfig {
  /** The start date */
  start: DateTime;
  /** The end of the list. Can be a specific date or a count of times, weeks or months */
  end: { date: DateTime; type: 'date' } | Count;
  /** A pattern of which days to look for. See {@link Pattern}. */
  pattern?: Pattern;
}

/**
 * Describes how many items total to produce. It can count
 * in terms of days, weeks or months
 * @public
 */
export type Count = {
  /** Number of times to count */
  times: number;
  /** What to count */
  type: 'times' | 'weeks' | 'months';
};
export const defaultConfig: DateConfig = {
  start: DateTime.now(),
  end: { times: 1, type: 'times' },
};
