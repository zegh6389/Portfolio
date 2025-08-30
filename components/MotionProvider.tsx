"use client";

import { ReactNode } from "react";
import { LazyMotion, domAnimation } from "framer-motion";

/**
 * Wraps children with Framer Motion LazyMotion to tree-shake unused features
 * and cut bundle size. Use this high in the tree (layout) once.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
