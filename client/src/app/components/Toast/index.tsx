"use client";

import { COLORS } from "@/constants";
import { IToastData, useToast } from "@/hooks/useToast";
import { cn } from "@/utils";
import { CircleCheck, CircleX, Info, X } from "lucide-react";

const Toast = () => {
  const { type, isOpen, hideToast, data } = useToast();
  if (type === null) return null;
  const toastData:
    | IToastData["success"]
    | IToastData["error"]
    | IToastData["info"]
    | null = data[type];

  const Icon = () =>
    type === "success" ? (
      <CircleCheck fill={COLORS[0]} stroke="white" />
    ) : type === "error" ? (
      <CircleX fill={COLORS[2]} stroke="white" />
    ) : (
      <Info className="stroke-blue-500" />
    );
  return (
    <div
      className={cn(
        "fixed bottom-5 right-5 p-5 bg-white rounded-2xl min-w-60 min-h-10 flex items-center justify-start z-[99999999]",
        "shadow-[0px_0px_1px_0px_rgba(0,0,0,0.25),_0px_4px_8px_0px_rgba(0,0,0,0.05),_0px_4px_32px_0px_rgba(0,0,0,0.05)]",
        "slide-in-from-right"
      )}
    >
      <Icon />
      <div className="ml-2 mr-4">{toastData?.message}</div>
      <X
        className="cursor-pointer ml-auto mr-0"
        color="black"
        onClick={hideToast}
      />
    </div>
  );
};

export default Toast;
