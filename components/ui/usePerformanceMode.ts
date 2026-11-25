"use client";

import { useEffect, useSyncExternalStore } from "react";

let cachedLite: boolean | null = null;
const listeners = new Set<() => void>();

function computeLite(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isSmall = window.matchMedia("(max-width: 767px)").matches;
    const cores = navigator.hardwareConcurrency ?? 8;
    const memory =
      (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;

    return prefersReduced || isSmall || cores <= 4 || memory <= 4;
  } catch {
    return false;
  }
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  cachedLite = computeLite();

  const queries = [
    window.matchMedia("(max-width: 767px)"),
    window.matchMedia("(prefers-reduced-motion: reduce)"),
  ];
  const onChange = () => {
    cachedLite = computeLite();
    listeners.forEach((listener) => listener());
  };

  queries.forEach((query) => query.addEventListener("change", onChange));

  return () => {
    listeners.delete(callback);
    queries.forEach((query) => query.removeEventListener("change", onChange));
  };
}

function getSnapshot(): boolean {
  if (cachedLite === null) cachedLite = computeLite();
  return cachedLite;
}

function getServerSnapshot(): boolean {
  return false;
}

export function usePerformanceMode(): { lite: boolean } {
  const lite = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.dataset.perf = lite ? "lite" : "full";
  }, [lite]);

  return { lite };
}
