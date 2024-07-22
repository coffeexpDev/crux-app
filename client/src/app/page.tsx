// export default function Home() {
//   return <main className=""></main>;
// }

"use client";
import React, { SyntheticEvent, useEffect, useMemo, useState } from "react";
import {
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  TooltipProps,
  tooltipClasses,
  Switch,
  FormControlLabel,
  FormControlLabelProps,
} from "@mui/material";
import {
  CollectionPeriod,
  HistorgramTimeserie,
  HistoryResponse,
  HistoryResponseWithType,
  MetricDate,
  MetricValue,
  SuccessResponse,
  SuccessResponseWithType,
} from "@/types";
import { calcAvgMetrics, cn } from "@/utils";
import { ChevronDown } from "lucide-react";
import styled from "@emotion/styled";
import moment from "moment";

const HEADERS = ["Metric", "Good", "Needs Improvement", "Poor", "Graph"];
const COLORS = ["#00C49F", "#FFBB28", "#FF8042"];

const CustomTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#d9f7ff",
    color: "rgba(0, 0, 0, 0.87)",
    // maxWidth: 220,
    margin: 10,
    boxShadow:
      "0px 0px 1px 0px rgba(0, 0, 0, 0.25), 0px 4px 8px 0px rgba(0, 0, 0, 0.05), 0px 16px 32px 0px rgba(0, 0, 0, 0.05)",
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: "#d9f7ff",
  },
}));

const getFormattedDate = (date: string, format: string = "YYYY-MM-DD") =>
  moment(date).format(format);
const getDateFromPeriod = (date: MetricDate) =>
  Object.keys(date)
    .map((k) => date[k])
    .join("-");

const CruxChart = ({
  histogram,
  p75,
}: {
  histogram?: MetricValue["histogram"];
  p75: number;
}) => {
  if (!histogram) return null;
  const plotData = histogram?.map((h, idx: number) => ({
    id: HEADERS[idx + 1],
    value: h.density,
  }));
  const bounds: {
    lower: number;
    upper: number;
  } = {
    lower:
      (typeof histogram[0].end === "string"
        ? Number.parseFloat(histogram[0].end)
        : histogram[0].end) || NaN,
    upper:
      (typeof histogram[2].start === "string"
        ? Number.parseFloat(histogram[2].start)
        : histogram[2].start) || NaN,
  };
  let placement: number = NaN;
  if (!isNaN(p75)) {
    if (p75 < bounds.lower) {
      placement = (p75 / bounds.lower) * 100 * (histogram[0].density as number);
    } else if (p75 < bounds.upper) {
      placement =
        (p75 / bounds.upper) * 100 * (histogram[1].density as number) +
        (histogram[0].density as number) * 100;
    } else if (p75 > bounds.upper) {
      placement =
        (p75 / bounds.upper) * 100 -
        100 +
        ((histogram[1].density as number) * 100 +
          (histogram[0].density as number) * 100);
    }
  }
  // if (!isNaN(placement)) {
  //   if (placement < (histogram[1].density as number) * 100) {
  //     placement += (histogram[0].density as number) * 100;
  //   }
  // }
  // console.log("p75 =>", p75, bounds, placement);
  const Pin = () => {
    return (
      <div className="pin" style={{ left: `${placement || 0}%` }}>
        <span className="absolute text-xs font-semibold -top-[200%] left-full -translate-x-1/2 ">
          {p75 > 1
            ? p75 < 1000
              ? `${p75}ms`
              : `${(p75 / 1000).toFixed(2)}s`
            : p75}
        </span>
      </div>
    );
  };
  return (
    <div className="flex w-full gap-0 rounded-sm">
      <Pin />
      {histogram?.map((h, idx) => {
        return (
          // <CustomTooltip key={idx} idx={idx} bounds={bounds} data={h}>
          <CustomTooltip
            key={idx}
            title={
              <div className="tooltip">
                <div className="title">
                  {idx === 0
                    ? "Good"
                    : idx === 1
                    ? "Needs Improvement"
                    : "Poor"}{" "}
                  (
                  {idx === 0
                    ? `0 - ${bounds.lower}${bounds.lower > 1 ? "ms" : ""}`
                    : idx === 1
                    ? `${bounds.lower}${bounds.lower > 1 ? "ms" : ""} - ${
                        bounds.upper
                      }${bounds.upper > 1 ? "ms" : ""}`
                    : ` > ${bounds.upper}${bounds.upper > 1 ? "ms" : ""}`}
                  )
                </div>
                <div className="percent">
                  {((h.density as number) * 100).toFixed(2)}%
                </div>
              </div>
            }
            arrow
          >
            <div
              // key={h.density}
              className={cn("histogram", "relative h-2.5")}
              style={{
                // height: 20,
                width: `${(h.density as number) * 100}%`,
                background: COLORS[idx],
              }}
            ></div>
          </CustomTooltip>
        );
      })}
    </div>
  );
};
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
                    (typeof m?.percentiles?.p75 === "string"
                      ? Number.parseFloat(m?.percentiles?.p75)
                      : m?.percentiles?.p75
                    ).toFixed(2) || NaN
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

const SiteDetails = ({
  record,
  history,
}: {
  record: HistoryResponseWithType | SuccessResponseWithType;
  history: boolean;
}) => {
  const collectionPeriods = history
    ? record.record.collectionPeriods
    : [record.record.collectionPeriod];
  const rStart = getDateFromPeriod(collectionPeriods[0].firstDate);
  const rEnd = getDateFromPeriod(
    collectionPeriods[collectionPeriods.length - 1].lastDate
  );

  const [range, setRange] = useState<{
    start: string;
    end: string;
  }>({
    start: moment(rStart as string).format("YYYY-MM-DD"),
    end: moment(rEnd as string).format("YYYY-MM-DD"),
  });
  const dataRange: { start: number; end: number } = useMemo(() => {
    const start = collectionPeriods.findIndex((cp: CollectionPeriod) => {
      return (
        moment(getDateFromPeriod(cp.firstDate)).isSameOrAfter(
          moment(range.start)
        ) &&
        moment(getDateFromPeriod(cp.lastDate)).isSameOrBefore(moment(range.end))
      );
    });
    const end =
      collectionPeriods.length -
      [...collectionPeriods]
        .reverse()
        .findIndex((cp: CollectionPeriod) =>
          moment(getDateFromPeriod(cp.lastDate)).isSameOrBefore(range.end)
        );
    // console.log("range =>", { start, end });
    return { start, end };
  }, [range]);
  // let avgMetrics;
  // if (history) {
  //   const historyMetrics = (record as HistoryResponseWithType).record.metrics;
  //   avgMetrics = calcAvgMetrics(historyMetrics);
  // } else {
  //   const successMetrics = (record as SuccessResponseWithType).record.metrics;
  //   avgMetrics = successMetrics;
  // }
  const avgMetrics = useMemo(() => {
    if (history) {
      const historyMetrics = (record as HistoryResponseWithType).record.metrics;
      return calcAvgMetrics(historyMetrics, dataRange);
    } else {
      const successMetrics = (record as SuccessResponseWithType).record.metrics;
      return successMetrics;
    }
  }, [record.record.metrics, dataRange]);

  return (
    <div className="flex flex-col">
      {collectionPeriods.length && (
        <div className="flex gap-2">
          <div>Calculating average metrics from</div>
          <strong>{moment(range.start).format("DD-MM-YYYY")}</strong>
          <div>to</div>
          <strong>{moment(range.end).format("DD-MM-YYYY")}</strong>
        </div>
      )}
      <div className="flex gap-10">
        <input
          type="date"
          min={getFormattedDate(rStart as string, "YYYY-MM-DD")}
          max={getFormattedDate(rEnd as string, "YYYY-MM-DD")}
          value={range.start}
          pattern="\d{2}-\d{2}-\d{4}"
          onChange={(e) =>
            setRange((prev) => ({
              ...prev,
              start: getFormattedDate(e.target.value),
            }))
          }
        />
        <input
          type="date"
          min={getFormattedDate(rStart as string, "YYYY-MM-DD")}
          max={getFormattedDate(rEnd as string, "YYYY-MM-DD")}
          value={range.end}
          pattern="\d{2}-\d{2}-\d{4}"
          onChange={(e) =>
            setRange((prev) => ({
              ...prev,
              end: getFormattedDate(e.target.value),
            }))
          }
        />
      </div>
      <SiteMetricsTable metrics={avgMetrics} />
    </div>
  );
};

const Home = () => {
  const [url, setUrl] = useState("");
  const [data, setData] = useState<Array<SuccessResponse | HistoryResponse>>(
    []
  );
  const [apiMethod, setApiMethod] = useState<"history" | "latest">("latest");
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await (
        await fetch("http://localhost:5000/api/crux", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url,
            method: apiMethod,
            metrics: [
              "cumulative_layout_shift",
              "first_contentful_paint",
              "first_input_delay",
              "largest_contentful_paint",
              "interaction_to_next_paint",
              "experimental_time_to_first_byte",
            ],
          }),
        })
      ).json();
      setData((prev) => [...prev, response]);
    } catch (error) {
      console.error("Error fetching CrUX data:", error);
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex gap-5">
          <TextField
            label="URL"
            value={url}
            className="w-full"
            onChange={(e) => setUrl(e.target.value)}
            size="small"
          />
          <FormControlLabel
            control={<Switch />}
            label="History"
            classes={{ label: "font-semibold" }}
            onChange={(_, checked) => {
              setApiMethod(checked ? "history" : "latest");
            }}
          />
          <Button
            type="submit"
            className="bg-blue-700 h-10 text-white font-semibold rounded-[2xl] px-5 hover:bg-blue-800"
          >
            Search
          </Button>
        </div>
      </form>
      <div className="mt-10 flex flex-col gap-0">
        {data?.map((d, idx) => {
          return (
            <Accordion key={idx}>
              <AccordionSummary expandIcon={<ChevronDown />}>
                {d.record.key.origin || d.record.key.url} (
                {(d.record as any).collectionPeriods ? "History" : "Latest"})
              </AccordionSummary>
              <AccordionDetails>
                <SiteDetails
                  record={{
                    type: !!(d.record as any).collectionPeriods
                      ? "history"
                      : "success",
                    record: d.record,
                  }}
                  history={!!(d.record as any).collectionPeriods}
                />
              </AccordionDetails>
            </Accordion>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
