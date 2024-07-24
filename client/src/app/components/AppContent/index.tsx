"use client";
import React, { FormEvent, useEffect, useState } from "react";
import { TextField, Button, Switch, FormControlLabel } from "@mui/material";
import {
  ApiMethod,
  HistoryResponse,
  RecordType,
  SuccessResponse,
} from "@/types";
import SiteRow from "../SiteRow";
import { getCrUXReport } from "@/api/crux";
import { useToast } from "@/hooks/useToast";
import { cn, normalizeUrl } from "@/utils";

const RECORD_FILTER_TYPE = [
  "all" as const,
  "history" as const,
  "latest" as const,
];

const FilterOption = ({
  text,
  active,
  onClick,
}: {
  text: RecordType;
  active: boolean;
  onClick: (recordType: RecordType) => void;
}) => {
  return (
    <button
      className={cn(
        "px-2 rounded-[80px] min-w-10 h-5 flex items-center justify-center capitalize font-normal border text-sm",
        !active ? "opacity-75" : "font-semibold",
        text === "all"
          ? "bg-black bg-opacity-20"
          : text === "history"
          ? "bg-blue-200"
          : "bg-green-200"
      )}
      onClick={(e) => {
        onClick(text);
      }}
    >
      {text}
    </button>
  );
};
const AppContent = () => {
  const [urls, setUrls] = useState<string>("");
  const [data, setData] = useState<Array<SuccessResponse | HistoryResponse>>(
    []
  );
  const [filteredData, setFilteredData] = useState<
    Array<SuccessResponse | HistoryResponse>
  >([]);
  const [apiMethod, setApiMethod] = useState<ApiMethod>("latest");
  const [filters, setFilters] = useState<{
    recordType: RecordType;
  }>({ recordType: "all" });

  const { showToast } = useToast();
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (urls === "") {
        throw new Error("Please enter aleast one url");
      }
      const urlsToSend = urls
        ?.trim()
        ?.split(",")
        ?.filter((_) => _.trim() !== "")
        ?.map((url) => {
          try {
            const normalizedUrl = normalizeUrl(url);

            return normalizedUrl;
          } catch (error) {
            throw new Error(`Invalid URL: "${url}"`);
          }
        })
        ?.join(",");
      setUrls(urlsToSend);
      const reports = await getCrUXReport(urlsToSend, apiMethod);
      setData((prev) => [...prev, ...reports]);
    } catch (error: unknown) {
      if (error instanceof Error) {
        showToast("error", { error: { message: error.message } });
      } else {
        showToast("error", { error: { message: "An unknown error occured" } });
      }
    }
  };

  useEffect(() => {
    const { recordType } = filters;
    if (recordType === "all") {
      setFilteredData(data);
    } else if (recordType === "history") {
      setFilteredData(data.filter((_) => "collectionPeriods" in _.record));
    } else {
      setFilteredData(data.filter((_) => "collectionPeriod" in _.record));
    }
  }, [filters, data]);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex gap-5">
          <TextField
            label="URL"
            value={urls}
            className="w-full"
            onChange={(e) => setUrls(e.target.value)}
            size="small"
          />
          <div className="text-xs text-black text-opacity-10">
            Enter multiple urls by seperating them with commas(,). Example:
            "https://web.dev,https://www.google.com"
          </div>

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
        <div className="flex gap-1 mt-5">
          {urls &&
            urls
              .split(",")
              ?.filter((_) => _.trim() !== "")
              .map((url, idx: number) => (
                <span
                  className="px-2 py-1 rounded-2xl border text-sm border-blue-700 border-opacity-15"
                  key={idx}
                >
                  {url.trim()}
                </span>
              ))}
        </div>
      </form>
      <div className="mt-10 flex flex-col gap-0">
        <h3 className="font-bold w-full border-b-[0.5px] border-b-black border-opacity-10 text-lg">
          <div className="flex w-full justify-between items-center pb-2.5">
            <div>Results</div>
            <div className="flex gap-2 items-center">
              {RECORD_FILTER_TYPE.map((text, idx) => (
                <FilterOption
                  key={idx}
                  text={text}
                  active={filters.recordType === text}
                  onClick={(recordType) => {
                    setFilters((prev) => ({ ...prev, recordType }));
                  }}
                />
              ))}
            </div>
          </div>
        </h3>
        {filteredData?.map((d, idx) => {
          const isHistoryRecord = "collectionPeriods" in d.record;
          const record: any = isHistoryRecord
            ? { type: "history" as const, record: d.record }
            : { type: "success" as const, record: d.record };
          return (
            <SiteRow
              key={idx}
              record={record}
              isHistoryRecord={isHistoryRecord}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AppContent;
