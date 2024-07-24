import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  HistorgramTimeserie,
  HistoryResponseWithType,
  HistoryValue,
  MetricDate,
  SuccessResponseWithType,
} from "./types";
import moment from "moment";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const calcAvgMetrics = (
  metrics: HistoryResponseWithType["record"]["metrics"],
  range?: { start: number; end: number }
) => {
  return Object.keys(metrics).reduce((acc, curKey) => {
    const metric = metrics[
      curKey as keyof HistoryResponseWithType["record"]["metrics"]
    ] as any;

    // calulate average p75 metric value across all collection periods
    const p75 =
      // range.start & range.end can be used to select and calulate average metrics for records(collectionPeriods) that fall between the start and end dates
      metric.percentilesTimeseries.p75s
        .slice(
          range?.start || 0,
          range?.end || metric.percentilesTimeseries.p75s.length
        )
        .reduce(
          (acc: SuccessResponseWithType["record"]["metrics"], cur: string) => {
            return !isNaN(parseFloat(cur))
              ? (acc as number) + parseFloat(cur)
              : acc;
          },
          0
        ) /
      (!!range
        ? range.end - range.start
        : metric.percentilesTimeseries.p75s.length);
    // calulate average histogramTimeseries metric value across all collection periods
    acc[curKey as keyof SuccessResponseWithType["record"]["metrics"]] = {
      histogram: metric.histogramTimeseries.map((ht: HistorgramTimeserie) => ({
        start: ht.start,
        ...(ht.end && { end: ht.end }),
        density:
          (ht.densities
            .slice(range?.start || 0, range?.end || ht.densities.length) // range.start & range.end can be used to select and calulate average metrics for records(collectionPeriods) that fall between the start and end dates
            .reduce(
              (acc, cur) =>
                !isNaN(parseFloat(cur as string))
                  ? (acc as number) + parseFloat(cur as string)
                  : acc,
              0
            ) as number) /
          (!!range ? range.end - range.start : ht.densities.length),
      })),
      percentiles: {
        p75: p75 >= 100 ? 100 : p75,
      },
    };
    return acc;
  }, {} as SuccessResponseWithType["record"]["metrics"]);
};
// utility function to format data using moment
export const getFormattedDate = (date: string, format: string = "YYYY-MM-DD") =>
  moment(date).format(format);
export const getDateFromPeriod = (date: MetricDate) =>
  Object.keys(date)
    .map((k) => date[k as keyof MetricDate])
    .join("-");

export const normalizeUrl = (url: string) => {
  const u = new URL(url);
  return u.origin + u.pathname;
};
