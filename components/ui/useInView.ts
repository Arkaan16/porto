"use client";

import { useEffect, useRef } from "react";

/**
 * Toggles a `data-inview` attribute ("on" / "off") directly on the element so
 * CSS can pause infinite animations outside the viewport without re-renders.
 */
export function useInViewPause<T extends HTMLElement = HTMLElement>(
  rootMargin = "160px",
) {
  const ref = useRef<T>(null);
  const visibleRef = useRef(true);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.dataset.inview = "on";

    if (typeof IntersectionObserver === "undefined") {
      return () => {
        delete element.dataset.inview;
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibleRef.current = entry.isIntersecting;
          element.dataset.inview = entry.isIntersecting ? "on" : "off";
        }
      },
      { rootMargin, threshold: 0 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      delete element.dataset.inview;
    };
  }, [rootMargin]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.dataset.inview = visibleRef.current ? "on" : "off";
  });

  return ref;
}
