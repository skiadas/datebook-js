import { describe, it, expect } from 'vitest';
import Datebook from '../src/index';

import { DateTime } from 'luxon';
const startDate = DateTime.fromObject({ year: 2025, month: 6, day: 16 });

describe('getDates()', () => {
  it('works for one date', () => {
    const results = new Datebook().startOn(startDate).for(1, 'times').dates;
    expect(results.length).toBe(1);
    const date = results[0];
    expect(date.ymd).toStrictEqual([2025, 6, 16]);
    expect(date.daycount).toBe(1);
    expect(date.weekcount).toBe(1);
    expect(date.iso).toBe('2025-06-16');
    expect(date.weekday).toBe('Monday');
  });
  it('works on weekly', () => {
    const results = new Datebook().startOn(startDate).on('Monday').for(4, 'weeks').dates;
    expect(results.length).toBe(4);
    expect(results[1].ymd).toStrictEqual([2025, 6, 23]);
    expect(results[2].ymd).toStrictEqual([2025, 6, 30]);
    expect(results[3].ymd).toStrictEqual([2025, 7, 7]);
    expect(results[3].weekcount).toStrictEqual(4);
  });
  it('works on MWF', () => {
    const results = new Datebook()
      .startOn(startDate)
      .on('Monday', 'Wednesday', 'Friday')
      .for(4, 'weeks').dates;
    expect(results.length).toBe(12);
  });
  it('works on MWF starting from a non-Monday', () => {
    const results = new Datebook()
      .startOn(startDate.plus({ days: 2 }))
      .on('Monday', 'Wednesday', 'Friday')
      .for(4, 'weeks').dates;
    expect(results.length).toBe(11);
    // Weeks should switch on that Monday
    expect(results[2].weekcount).toBe(2);
  });
  it('works on MWF for a month, starting from a non-Monday', () => {
    const results = new Datebook()
      .startOn(startDate.plus({ days: 1 }))
      .on('Monday', 'Wednesday', 'Friday')
      .for(1, 'months').dates;
    // Start at Tuesday (2025-6-17): 18, 20, 23, 25, 27, 30
    expect(results.length).toBe(6);
  });
  it('includes format string results', () => {
    const results = new Datebook().startOn(startDate).for(1, 'times').formatted();
    expect(results[0]).toBe('2025-06-16');
  });
  it('can export to formatted strings directly', () => {
    const results = new Datebook()
      .startOn(startDate)
      .for(1, 'times').formatted('%D day');
    expect(results.length).toBe(1);
    expect(results[0]).toBe('1st day');
  });
});
