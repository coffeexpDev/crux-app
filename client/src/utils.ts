import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { HistorgramTimeserie, HistoryResponseWithType } from "./types";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const calcAvgMetrics = (
  metrics: HistoryResponseWithType["record"]["metrics"],
  range?: { start: number; end: number }
) => {
  return Object.keys(metrics).reduce((acc, curKey) => {
    const metric = metrics[curKey];
    acc[curKey] = {
      histogram: metric.histogramTimeseries.map((ht: HistorgramTimeserie) => ({
        start: ht.start,
        ...(ht.end && { end: ht.end }),
        density:
          ht.densities
            .slice(range?.start || 0, range?.end || ht.densities.length)
            .reduce(
              (acc, cur) =>
                !isNaN(Number.parseFloat(cur))
                  ? acc + Number.parseFloat(cur)
                  : acc,
              0
            ) / (!!range ? range.end - range.start : ht.densities.length),
      })),
      percentiles: {
        p75:
          metric.percentilesTimeseries.p75s
            .slice(
              range?.start || 0,
              range?.end || metric.percentilesTimeseries.p75s.length
            )
            .reduce((acc, cur) => {
              // console.log({ acc, cur: Number.parseFloat(cur) });
              return !isNaN(Number.parseFloat(cur))
                ? acc + Number.parseFloat(cur)
                : acc;
            }, 0) /
          (!!range
            ? range.end - range.start
            : metric.percentilesTimeseries.p75s.length),
      },
    };
    return acc;
  }, {});
};
