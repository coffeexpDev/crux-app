import { Nullable } from "@/types";
import { create } from "zustand";

/** Custom hook to allow triggering toast notifications from anywhere */

export type ToastType = "success" | "error" | "info";

export interface IToastData {
  success?: {
    message: string;
  };
  error?: {
    message: string;
  };
  info?: {
    message: string;
  };
}

interface IToastStore {
  type: Nullable<ToastType>;
  data: IToastData;
  isOpen: boolean;
  showToast: <T extends ToastType>(
    type: T,
    data?: Record<T, IToastData[T]>,
    timeout?: number
  ) => void;
  hideToast: () => void;
}

export const useToast = create<IToastStore>((set) => ({
  type: null,
  isOpen: false,
  data: {},
  showToast: (type, data, timeout = 3000) => {
    if (useToast.getState().isOpen) {
      useToast.getState().hideToast();
    }
    setTimeout(() => {
      set({ type, data: data ?? {}, isOpen: true });
    }, 500);
    setTimeout(() => {
      useToast.getState().hideToast();
    }, timeout);
  },
  hideToast: () => set({ isOpen: false, type: null, data: {} }),
}));
