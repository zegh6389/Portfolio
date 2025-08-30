import { useEffect, useRef, useState } from "react";

// Returns scroll progress (0 - 100)
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const calc = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const value = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, value)));
    };
    const onScroll = () => requestAnimationFrame(calc);
    calc();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return progress;
}

// Returns boolean indicating if page has been scrolled past a small threshold
export function useIsScrolled(threshold: number = 10) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const check = () => setScrolled(window.scrollY > threshold);
    const onScroll = () => requestAnimationFrame(check);
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

// Tracks which section id is currently active based on viewport position
export function useActiveSection(sectionIds: string[], offsetRatio: number = 0.35) {
  const [active, setActive] = useState<string>(sectionIds[0] || "");
  const ticking = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || !sectionIds.length) return;

    const getActive = () => {
      const viewportHeight = window.innerHeight;
      const offset = viewportHeight * offsetRatio;
      let current = sectionIds[0];
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const topVisible = rect.top <= offset;
        const bottomVisible = rect.bottom > offset;
        if (topVisible && bottomVisible) {
          current = id;
          break;
        }
      }
      setActive(current);
    };

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(() => {
          getActive();
          ticking.current = false;
        });
      }
    };

    getActive();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sectionIds, offsetRatio]);

  return active;
}
