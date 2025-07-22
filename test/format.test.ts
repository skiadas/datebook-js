import { describe, it, expect } from 'vitest';
import { format } from '../src/Format';

import { DateTime } from 'luxon';
import { datebookFromDate } from '../src/DatebookEntry';
const date = DateTime.fromObject({ year: 2025, month: 6, day: 16 }) as DateTime<true>;
const dbe = datebookFromDate(date, []);

describe('format()', () => {
  it('works with D, D', () => {
    expect(format(dbe, 'Day %d, %D')).toBe('Day 1, 1st');
  });
  it('works with w, W', () => {
    expect(format(dbe, 'Week %w, %W')).toBe('Week 1, 1st');
  });
  it('Turns %% to %', () => {
    expect(format(dbe, 'Day %%%d, %D')).toBe('Day %1, 1st');
  });
  it('Preserves other %', () => {
    expect(format(dbe, 'Day %p%d, %D')).toBe('Day %p1, 1st');
  });
  it('Delegates %{...} to luxon', () => {
    expect(format(dbe, 'Year %{yyyy}')).toBe('Year 2025');
  });
});
