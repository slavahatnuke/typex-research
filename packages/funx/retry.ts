export async function retry<Result>(
  fn: (attempt: number) => Result,
  { attempts }: { attempts: number },
) {
  let lastError: any;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}
