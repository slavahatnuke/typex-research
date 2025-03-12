export function UTCDate() {
  const date = new Date();

  const utc = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  );

  return new Date(utc);
}

export function UTCTime() {
  return UTCDate().getTime();
}

export function offsetDate(now: Date, offsetMs: number): Date {
  return new Date(now.getTime() + offsetMs);
}
