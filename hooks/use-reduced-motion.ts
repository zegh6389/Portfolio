import { useEffect, useState } from "react";

/**
 * Custom hook to detect if the user prefers reduced motion (for accessibility).
 * Returns true if reduced motion is preferred, false otherwise.
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(mediaQuery.matches);
      const handler = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, []);

  return reducedMotion;
}
