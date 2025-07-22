export function generate<S, T>({
  start,
  convert,
  include,
  keepGoing,
  next,
}: {
  start: S;
  convert: (s: S, soFar: readonly T[]) => T;
  include: (t: T, soFar: readonly T[]) => boolean;
  keepGoing: (t: T, soFar: readonly T[]) => boolean;
  next: (s: S, soFar: readonly T[]) => S;
}): T[] {
  const soFar: T[] = [];
  let curr = start;
  while (true) {
    const t = convert(curr, soFar);
    if (!keepGoing(t, soFar)) break;
    if (include(t, soFar)) soFar.push(t);
    curr = next(curr, soFar);
  }
  return soFar;
}
