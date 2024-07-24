import { SuccessResponse } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import CruxChart from "./CruxChart";

const HEADERS = ["Metric", "Good", "Needs Improvement", "Poor", "Graph"];

const MetricHead = ({}: {}) => {
  return (
    <TableHead>
      <TableRow>
        {HEADERS.map((h: string) => {
          return <TableCell key={h}>{h}</TableCell>;
        })}
      </TableRow>
    </TableHead>
  );
};

const SiteMetricsTable = ({
  metrics,
}: {
  metrics: SuccessResponse["record"]["metrics"];
}) => {
  const metricKeys = Object.keys(metrics).sort() as Array<
    keyof SuccessResponse["record"]["metrics"]
  >;
  const filteredMetrics: Partial<SuccessResponse["record"]["metrics"]> =
    metricKeys.reduce((acc, cur) => {
      if (!!metrics[cur]?.histogram) {
        acc = {
          ...acc,
          [cur]: metrics[cur],
        };
      }
      return acc;
    }, {});
  return (
    <Table>
      <colgroup>
        <col className="" />
        <col className="" />
        <col className="" />
        <col className="" />
        <col className="w-1/3" />
      </colgroup>
      <MetricHead />
      <TableBody>
        {Object.keys(filteredMetrics).map((key) => {
          const m =
            filteredMetrics[key as keyof SuccessResponse["record"]["metrics"]];
          return (
            <TableRow key={key}>
              <TableCell className="capitalize">
                {key.replaceAll("_", " ")}
              </TableCell>
              {m?.histogram?.map((obj, idx: number) => {
                return (
                  typeof obj?.density === "number" && (
                    <TableCell key={idx}>
                      {(obj.density * 100).toFixed(2)}%
                    </TableCell>
                  )
                );
              })}

              <TableCell>
                <CruxChart
                  histogram={m?.histogram}
                  p75={
                    (m?.percentiles &&
                      ((typeof m?.percentiles?.p75 === "string"
                        ? parseFloat(m?.percentiles?.p75)
                        : m?.percentiles?.p75
                      ).toFixed(2) as any)) ||
                    NaN
                  }
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default SiteMetricsTable;
