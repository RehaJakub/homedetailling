"use client";

import { useEffect } from "react";

/** Registers the <model-viewer> web component from our own application bundle. */
export function ModelViewerLoader() {
  useEffect(() => {
    void import("@google/model-viewer");
  }, []);

  return null;
}
