function uiTime(date: Date | null) {
  if (date instanceof Date) {
    return date.toISOString();
  } else {
    return 'N/A';
  }
}

type IReport = {
  elapsedMilliseconds: number | null;
  startedAt: Date | null;
  finishedAt: Date | null;
  trackedAt: Date | null;
  RPM: number | null;
  RPS: number | null;
  textReport: string;
};

export function SpeedTest({
  name = '',
  every = 1000,
  inIntervalMilliseconds = 15000,
  publishReport = (report: IReport) => console.log(report.textReport),
}: Partial<{
  name: string;
  every: number | null;
  inIntervalMilliseconds: number | null;
  publishReport: (report: IReport) => unknown;
}> = {}) {
  let counter = 0;
  let startedAt: Date | null = null;
  let trackedAt: Date | null = null;
  let reportedAt: Date | null = null;

  function createReport(finishedAt: Date | null = null): IReport {
    const elapsed =
      startedAt && trackedAt ? trackedAt.getTime() - startedAt.getTime() : null;

    const RPM =
      counter && elapsed ? Math.round(counter / (elapsed / 60_000)) : null;

    const RPS =
      counter && elapsed ? Math.round(counter / (elapsed / 1000)) : null;

    const named = `${name ? `SpeedTest: ${name}; ` : ''}`;

    reportedAt = new Date();

    return {
      elapsedMilliseconds: elapsed,
      startedAt: startedAt,
      finishedAt: finishedAt,
      trackedAt: trackedAt,
      RPM,
      RPS,
      textReport: `${named}RPS: ${RPS ?? 'N/A'}; RPM: ${RPM ?? 'N/A'}; Counter: ${counter ?? 'N/A'}; Started: ${uiTime(startedAt)}; Elapsed: ${elapsed ?? 'N/A'}; Tracked: ${uiTime(trackedAt)}; Finished: ${uiTime(finishedAt)}`,
    };
  }

  return {
    track: (n: number = 1) => {
      if (!startedAt) {
        startedAt = new Date();
      }

      trackedAt = new Date();

      counter += n;

      if (every !== null) {
        if (counter % every === 0) {
          publishReport(createReport(null));
        }
      }

      if (inIntervalMilliseconds !== null && reportedAt) {
        const lastTimeReportedInMS =
          new Date().getTime() - reportedAt.getTime();
        if (lastTimeReportedInMS > inIntervalMilliseconds) {
          publishReport(createReport(null));
        }
      }
    },
    report: () => {
      publishReport(createReport(new Date()));
    },
    toString: () => {
      return createReport(new Date());
    },
  };
}
