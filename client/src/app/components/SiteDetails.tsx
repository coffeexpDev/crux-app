import {
  CollectionPeriod,
  HistoryResponseWithType,
  SuccessResponseWithType,
} from "@/types";
import {
  calcAvgMetrics,
  cn,
  getDateFromPeriod,
  getFormattedDate,
} from "@/utils";
import moment from "moment";
import { useMemo, useState } from "react";
import SiteMetricsTable from "./SiteMetricsTable";
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { METRICS } from "@/constants";

const SiteDetails = ({
  record,
  history,
}: {
  record: HistoryResponseWithType | SuccessResponseWithType;
  history: boolean;
}) => {
  const [metricsToShow, setMetricsToShow] = useState<string[]>([]);

  let collectionPeriods: CollectionPeriod[] = [];
  if (history && "collectionPeriods" in record.record) {
    collectionPeriods = record.record.collectionPeriods;
  } else if ("collectionPeriod" in record.record) {
    collectionPeriods = [record.record.collectionPeriod];
  }
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
    return { start, end };
  }, [range]);

  const avgMetrics = useMemo(() => {
    if (history) {
      const historyMetrics = (record as HistoryResponseWithType).record.metrics;
      return calcAvgMetrics(historyMetrics, dataRange);
    } else {
      const successMetrics = (record as SuccessResponseWithType).record.metrics;
      return successMetrics;
    }
  }, [record.record.metrics, dataRange]);

  const handleMetricsFilter = (
    evt: SelectChangeEvent<typeof metricsToShow>
  ) => {
    const {
      target: { value },
    } = evt;
    setMetricsToShow(typeof value === "string" ? value.split(",") : value);
  };

  return (
    <div className="flex flex-col">
      <div className="flex w-full justify-between">
        {collectionPeriods.length && history && (
          <div className="flex gap-2 items-center">
            <div>Calculating average metrics from</div>
            <strong>
              <input
                placeholder="MM/DD/YYYY"
                className="uppercase"
                id="startDate"
                name="startDate"
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
            </strong>
            <div>to</div>
            <strong>
              <input
                placeholder="MM/DD/YYYY"
                className="uppercase"
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
            </strong>
          </div>
        )}
        <div className="ml-auto mr-0">
          <FormControl sx={{ width: 300 }}>
            <InputLabel id="metricValuesFilter">
              Select Metrics To View
            </InputLabel>
            <Select
              labelId="metricValuesFilter"
              id="metricValuesFilter"
              multiple
              value={metricsToShow}
              onChange={handleMetricsFilter}
              input={
                <OutlinedInput
                  id="metricValueChip"
                  label="Select Metrics To View"
                />
              }
              size="small"
              renderValue={(selected) => (
                <Box
                  sx={{
                    display: "flex",
                    overflowX: "auto",
                    gap: 0.5,
                  }}
                >
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={value.replaceAll("_", " ")}
                      className="capitalize"
                    />
                  ))}
                </Box>
              )}
            >
              {METRICS.map((metric) => (
                <MenuItem key={metric} value={metric} className="capitalize">
                  {metric.replaceAll("_", " ")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>
      {collectionPeriods.length > 1 && (
        <>
          <div className="font-semibold mt-4">View from period</div>
          <div className="flex overflow-x-scroll no-scrollbar gap-4">
            {collectionPeriods.map((cp: CollectionPeriod, i) => {
              const start = moment(getDateFromPeriod(cp.firstDate)).format(
                "DD MMM YYYY"
              );
              const end = moment(getDateFromPeriod(cp.lastDate)).format(
                "DD MMM YYYY"
              );
              const active =
                range.start ===
                  moment(getDateFromPeriod(cp.firstDate)).format(
                    "YYYY-MM-DD"
                  ) &&
                range.end ===
                  moment(getDateFromPeriod(cp.lastDate)).format("YYYY-MM-DD");
              return (
                <button
                  key={i}
                  className={cn(
                    "px-2 rounded-[80px] whitespace-nowrap border border-black hover:bg-slate-50 hover:font-medium",
                    active && "bg-slate-200 hover:bg-slate-300"
                  )}
                  onClick={() => {
                    setRange((prev) => {
                      const start = moment(
                        getDateFromPeriod(cp.firstDate)
                      ).format("YYYY-MM-DD");
                      const end = moment(getDateFromPeriod(cp.lastDate)).format(
                        "YYYY-MM-DD"
                      );
                      return {
                        start:
                          start === prev.start
                            ? moment(rStart as string).format("YYYY-MM-DD")
                            : start,
                        end:
                          end === prev.end
                            ? moment(rEnd as string).format("YYYY-MM-DD")
                            : end,
                      };
                    });
                  }}
                >
                  {start} - {end}
                </button>
              );
            })}
          </div>
        </>
      )}
      <SiteMetricsTable metrics={avgMetrics} />
    </div>
  );
};

export default SiteDetails;
