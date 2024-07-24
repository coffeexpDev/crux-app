import { HistoryResponseWithType, SuccessResponseWithType } from "@/types";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { ChevronDown } from "lucide-react";
import SiteDetails from "./SiteDetails";
import { cn } from "@/utils";

/**
 * Accordian component used to render collapsable rows for each site's CrUX report
 */

const SiteRow = ({
  isHistoryRecord,
  record,
}: {
  isHistoryRecord: boolean;
  record: SuccessResponseWithType | HistoryResponseWithType;
}) => {
  return (
    <Accordion className="shadow-none border-b border-b-blue-700 border-opacity-10">
      <AccordionSummary expandIcon={<ChevronDown />} className="px-0">
        <div className="flex items-center gap-1 justfiy-between w-full">
          <div>{record.record.key.origin || record.record.key.url}</div>
          <span
            className={cn(
              "text-sm font-semibold px-2 py-1 rounded-[80px] bg-opacity-50",
              isHistoryRecord ? "bg-blue-200 " : "bg-green-200"
            )}
          >
            {isHistoryRecord ? "History" : "Latest"}
          </span>
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <SiteDetails record={record} history={isHistoryRecord} />
      </AccordionDetails>
    </Accordion>
  );
};

export default SiteRow;
