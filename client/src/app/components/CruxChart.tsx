import { COLORS, HEADERS } from "@/constants";
import { MetricValue } from "@/types";
import { cn } from "@/utils";
import { styled, Tooltip, tooltipClasses, TooltipProps } from "@mui/material";

const CustomTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#d9f7ff",
    color: "rgba(0, 0, 0, 0.87)",
    margin: 10,
    boxShadow:
      "0px 0px 1px 0px rgba(0, 0, 0, 0.25), 0px 4px 8px 0px rgba(0, 0, 0, 0.05), 0px 16px 32px 0px rgba(0, 0, 0, 0.05)",
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: "#d9f7ff",
  },
}));

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
        ? parseFloat(histogram[0].end)
        : histogram[0].end) || NaN,
    upper:
      (typeof histogram[2].start === "string"
        ? parseFloat(histogram[2].start)
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
  const Pin = () => {
    return (
      <div
        className="pin"
        style={{ left: `${(placement >= 100 ? 100 : placement) || 0}%` }}
      >
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
    <div className="flex w-full gap-0.5 rounded-sm">
      <Pin />
      {histogram?.map((h, idx) => {
        return (
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
              className={cn("histogram", "relative h-2.5")}
              style={{
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

export default CruxChart;
