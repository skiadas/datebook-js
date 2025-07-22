import { DateTime } from 'luxon';

/** A specific "datebook" entry, corresponding to a date in the
 * list of matched dates and following any counting in the list.
 *
 * @public
 */
export interface DatebookEntry {
  /** The corresponding DateTime object */
  datetime: DateTime<true>;
  /** The date in ISO 8601 format, as returned by {@link https://moment.github.io/luxon/api-docs/index.html#datetimetoisodate} Luxon's toISODate */
  iso: string;
  /** The triple of year/month/day */
  ymd: readonly [number, number, number];
  /** The day of the week, in US spelling */
  weekday: string;
  /** The number of days within the list up to this day, starting at 1 */
  daycount: number;
  /** The number of weeks within the list up to this day, starting at 1 */
  weekcount: number;
}
export function datebookFromDate(
  dt: DateTime<true>,
  dateList: readonly DatebookEntry[],
): DatebookEntry {
  const firstDatebook = dateList.at(0);
  const firstDate = firstDatebook?.datetime;
  const dbe: DatebookEntry = {
    datetime: dt,
    iso: dt.toISODate(),
    ymd: [dt.year, dt.month, dt.day],
    weekday: dt.setLocale('en-GB').weekdayLong,
    daycount: dateList.length + 1,
    weekcount:
      firstDate == undefined ? 1 : 1 + dt.diff(firstDate.startOf('week'), ['weeks', 'days']).weeks,
  };
  return dbe;
}
