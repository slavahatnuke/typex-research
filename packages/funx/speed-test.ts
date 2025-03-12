function uiTime(startedAt: number) {
  return new Date(startedAt).toISOString();
}

export function SpeedTest({
  name = '',
  every = 1000,
}: Partial<{ name: string; every: number | null }> = {}) {
  let counter = 0;
  let startedAt: number | null = null;
  let trackedAt: number | null = null;

  const log = (text: string) => console.log(text);

  function textReport(finishedAt: number | null = null) {
    const started = startedAt ? uiTime(startedAt) : null;
    const elapsed = startedAt && trackedAt ? trackedAt - startedAt : null;

    const RPM =
      counter && elapsed ? Math.round(counter / (elapsed / 60_000)) : null;

    const RPS =
      counter && elapsed ? Math.round(counter / (elapsed / 1000)) : null;

    const finished = finishedAt ? uiTime(finishedAt) : null;
    const tracked = trackedAt ? uiTime(trackedAt) : null;

    const named = `${name ? `SpeedTest: ${name}; ` : ''}`;

    return `${named}RPS: ${RPS ?? 'N/A'}; RPM: ${RPM ?? 'N/A'}; Counter: ${counter ?? 'N/A'}; Started: ${started ?? 'N/A'}; Elapsed: ${elapsed ?? 'N/A'}; Tracked: ${tracked ?? 'N/A'}; Finished: ${finished ?? 'N/A'}`;
  }

  const speedTest = {
    track: (n: number = 1) => {
      if (!startedAt) {
        startedAt = Date.now();
      }

      trackedAt = Date.now();

      counter += n;

      if (every !== null) {
        if (counter % every === 0) {
          log(textReport());
        }
      }
    },
    report: () => {
      log(textReport(Date.now()));
    },
    toString: () => {
      return textReport(Date.now());
    },
  };

  return speedTest;
}
