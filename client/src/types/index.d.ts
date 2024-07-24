export type Nullable<T> = T | null;
export type FormFactor = "ALL_FORM_FACTORS" | "PHONE" | "DESKTOP" | "TABLET";
export type Connection = "4G" | "3G" | "2G" | "slow-2G" | "offline";
export type MetricValue = {
  histogram: {
    start: number | string;
    end: number | string;
    density: number;
  }[];
  percentiles: {
    p75: number | string;
  };
};
export type MetricDate = {
  year: number;
  month: number;
  day: number;
};
export type CollectionPeriod = {
  firstDate: MetricDate;
  lastDate: MetricDate;
};
export type ErrorResponse = {
  error: {
    code: number;
    message: string;
    status: string;
  };
};
export type SuccessResponse = {
  record: {
    type: "success";
    key: {
      url?: string;
      origin?: string;
      effectiveConnectionType?: Connection;
      formFactor?: FormFactor;
    };
    metrics: {
      first_contentful_paint?: MetricValue;
      largest_contentful_paint?: MetricValue;
      first_input_delay?: MetricValue;
      cumulative_layout_shift?: MetricValue;
      interaction_to_next_paint?: MetricValue;
      experimental_time_to_first_byte?: MetricValue;
    };
    collectionPeriod: CollectionPeriod;
  };
  urlNormalizationDetails?: {
    originalUrl: string;
    normalizedUrl: string;
  };
};
export type PercentileValues = ((number | string) | null)[];
export type HistorgramTimeserie = {
  start: number;
  end?: number;
  densities: (number | "NaN")[];
};
export type HistoryValue = {
  histogramTimeseries: HistorgramTimeserie[];
  percentilesTimeseries: {
    p75s: (string | number)[];
  };
};
export type HistoryResponse = {
  record: {
    type: "history";
    key: {
      url?: string;
      origin?: string;
      formFactor?: FormFactor;
    };
    metrics: {
      first_input_delay?: HistoryValue;
      first_contentful_paint?: HistoryValue;
      largest_contentful_paint?: HistoryValue;
      cumulative_layout_shift?: HistoryValue;
      interaction_to_next_paint?: HistoryValue;
      experimental_time_to_first_byte?: HistoryValue;
    };
    collectionPeriods: CollectionPeriod[];
  };
  urlNormalizationDetails?: {
    originalUrl: string;
    normalizedUrl: string;
  };
};

export type HistoryResponseWithType = {
  type: "history";
  record: HistoryResponse["record"];
};
export type SuccessResponseWithType = {
  type: "success";
  record: SuccessResponse["record"];
};

export type ApiMethod = "history" | "latest";
export type RecordType = "history" | "latest" | "all";
