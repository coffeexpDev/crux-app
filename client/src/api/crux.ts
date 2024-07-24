import { METRICS } from "@/constants";
import { useToast } from "@/hooks/useToast";
import { ApiMethod } from "@/types";

export const getCrUXReport = async (urls: string, apiMethod: ApiMethod) => {
  try {
    const urlArray = urls
      .split(",")
      .filter((_) => _.trim() !== "")
      ?.map((_) => _.trim());
    const response = await (
      await fetch("https://crux-app-server.vercel.app/api/crux", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urls: urlArray,
          method: apiMethod,
          metrics: METRICS,
        }),
      })
    ).json();
    console.log("response =>", response);
    if (!!response) {
      const success = response?.filter((r: any) => r.status === "fulfilled");
      const failed = response?.filter((r: any) => r.status === "rejected");
      if (success.length === urlArray.length) {
        useToast.getState().showToast("success", {
          success: { message: "CrUX Report Generated Successfully" },
        });
      } else {
        useToast.getState().showToast("error", {
          error: {
            message: `Failed to generate CrUX Report for ${failed.length} URL${
              failed.length > 1 ? "s" : ""
            }`,
          },
        });
      }
      return response
        ?.filter((r: any) => r.status === "fulfilled")
        .map((_: any) => _.value);
    }
  } catch (error) {
    useToast.getState().showToast("error", {
      error: {
        message: `Unexpected error occured`,
      },
    });
    return [];
  }
};
