"use client";
import { useToast } from "@/hooks/useToast";
import { Fragment, useEffect, useState } from "react";
import Toast from "../Toast";

export const ToastProvider = () => {
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <Fragment>
      <Toast />
    </Fragment>
  );
};
