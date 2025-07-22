import { DateTime } from 'luxon';
import { matches, Pattern, Weekday, Count, DateConfig, defaultConfig } from './DateConfig';
import { generate } from './utils';
import { DatebookEntry, datebookFromDate } from './DatebookEntry';
import { format, defaultFormatString } from './Format';

/**
 * Represents a sequence of dates created based on provided rules.
 *
 * @remarks You can specify a configuration option in the constructor,
 * or use the provided chaining methods instead.
 *
 * @public
 */
export class Datebook {
  /**
   * The configuration to use to generate the list of dates.
   */
  config: DateConfig;
  /**
   *
   * @param config - Initial configuration to use. May be omitted to use the
   * default implementation or to use the chaining methods.
   *
   * @defaultValue `defaultConfig`
   */
  constructor(config?: DateConfig) {
    this.config = config || defaultConfig;
  }
  /**
   * Specify a specific number of dates to create,
   * in terms of days, weeks or months
   * @param n - The number of times
   * @param type - The type of count to do.
   * @returns The Datebook object, for chaining
   */
  for(n: number, type: Count['type']) {
    this.config.end = { times: n, type: type };
    return this;
  }

  /**
   * Specify a start date
   * @param dt - The date to start at
   * @returns The Datebook object, for chaining
   */
  startOn(dt: DateTime) {
    this.config.start = dt;
    return this;
  }

  /**
   * Specify an end date (inclusive)
   * @param dt - The date to end at
   * @returns The Datebook object, for chaining
   */
  endOn(dt: DateTime) {
    this.config.end = { date: dt, type: 'date' };
    return this;
  }

  /**
   * Specify a list of weekdays to include (e.g. only Mondays)
   * @param weekdays - A list of weekdays to include
   * @returns The Datebook object, for chaining
   */
  on(...weekdays: Weekday[]) {
    return _addToConfig(this, { weekdays });
  }

  /**
   * Specify a pattern for skipping weeks. n=1 means no weeks skipped.
   * n=2 means every other week, etc.
   * @param n - The number describing the pattern above
   * @returns The Datebook object, for chaining
   */
  everyWeek(n: number) {
    return _addToConfig(this, { everyNthWeek: n });
  }

  /**
   * Specify that only certain occurrences within a month should occur.
   * For example if $ns=[1,3]$ it will occur on the first and third occurrence
   * of the pattern within a given month
   * @param ns - The occurrences within the month
   * @returns The Datebook object, for chaining
   */
  ifTimeInMonth(...ns: number[]) {
    return _addToConfig(this, { nthInMonth: ns });
  }

  /**
   * Generate the list of dates as specified.
   * @returns A list of {@link DatebookEntry} objects
   */
  get dates() {
    return getDates(this.config);
  }

  /**
   * Generate the list of strings for the dates, using the provided
   * format string. See {@link format}
   * @returns A list of {@link DatebookEntry} objects
   */
  formatted(formatString?: string) {
    return this.dates.map((dbe) => format(dbe, formatString || defaultFormatString));
  }
}

function getDates(config: DateConfig): DatebookEntry[] {
  const { start, pattern, end } = config;
  const include = matches(pattern);
  const convert = datebookFromDate;
  const keepGoing = shouldConsider(end);
  const next = (curr: DateTime<true>) => curr.plus({ days: 1 });
  if (!start.isValid) throw new Error('Invalid start date: ' + start.invalidExplanation);
  return generate({
    start,
    convert,
    include,
    keepGoing,
    next,
  });
}

function shouldConsider(
  end: DateConfig['end'],
): (next: DatebookEntry, arr: readonly DatebookEntry[]) => boolean {
  return function (next, arr) {
    if (!('times' in end)) return false;
    switch (end.type) {
      case 'times':
        return arr.length < end.times;
      case 'weeks':
      case 'months': {
        const first = arr.at(0);
        if (first == undefined) return true;
        const unit = end.type == 'weeks' ? 'week' : 'month';
        const start = first.datetime.startOf(unit);
        const passed = next.datetime.diff(start, unit)[end.type];
        return passed < end.times;
      }
    }
  };
}

function _addToConfig(db: Datebook, newPattern: Pattern) {
  if (typeof newPattern == 'function') {
    db.config.pattern = newPattern;
  } else {
    db.config.pattern = {
      ...db.config.pattern,
      ...newPattern,
    };
  }
  return db;
}
