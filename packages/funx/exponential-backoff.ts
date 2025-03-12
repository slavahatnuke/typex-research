import { assert } from 'console';

// From https://www.tylercrosse.com/ideas/exponential-backoff/
export function exponentialBackoff({
  attempt,
  baseDelay = 100,
  maxDelay,
}: {
  attempt: number;
  baseDelay: number;
  maxDelay?: number;
}) {
  assert(attempt >= 1, `attempt must be greater than or equal to 1`);
  assert(baseDelay >= 1, `baseDelay must be greater than or equal to 1`);
  assert(
    maxDelay === undefined || maxDelay >= 1,
    `baseDelay must be greater than or equal to 1`,
  );

  const exponential = Math.pow(2, attempt) * baseDelay;
  const delay = maxDelay ? Math.min(exponential, maxDelay) : exponential;
  return Math.floor(Math.random() * delay);
}
