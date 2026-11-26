"use client";

import { useEffect, useState } from "react";

const SMALL_SCREEN = "(max-width: 767px)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function computeLite(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const cores = navigator.hardwareConcurrency ?? 8;
    const memory =
      (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;

    return (
      window.matchMedia(SMALL_SCREEN).matches ||
      window.matchMedia(REDUCED_MOTION).matches ||
      cores <= 4 ||
      memory <= 4
    );
  } catch {
    return false;
  }
}

export function usePerformanceMode(): { lite: boolean } {
  const [lite, setLite] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLite(computeLite());

    const queries = [
      window.matchMedia(SMALL_SCREEN),
      window.matchMedia(REDUCED_MOTION),
    ];
    const onChange = () => setLite(computeLite());

    queries.forEach((query) => query.addEventListener("change", onChange));

    return () => {
      queries.forEach((query) => query.removeEventListener("change", onChange));
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.perf = lite ? "lite" : "full";
  }, [lite]);

  return { lite };
}
