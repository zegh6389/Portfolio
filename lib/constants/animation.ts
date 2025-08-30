/**
 * Animation configuration constants
 * Centralized location for all animation-related magic numbers
 */

export const ANIMATION_CONFIG = {
  // Scroll behavior
  SCROLL_THRESHOLD: 20,
  SCROLL_THROTTLE_MS: 16, // 60fps
  
  // Magnetic button effect
  MAGNETIC_STRENGTH: 0.3,
  
  // Spring animations
  SPRING_CONFIG: {
    default: { stiffness: 350, damping: 20 },
    smooth: { stiffness: 100, damping: 20 },
    bouncy: { stiffness: 380, damping: 30 },
    slow: { stiffness: 200, damping: 40 },
  },
  
  // Transition durations (in ms)
  DURATION: {
    instant: 0,
    fast: 200,
    normal: 300,
    slow: 500,
    verySlow: 1000,
  },
  
  // Easing functions
  EASING: {
    linear: "linear",
    easeInOut: "easeInOut",
    easeOut: "easeOut",
    spring: [0.43, 0.13, 0.23, 0.96],
  },
  
  // Delays (in ms)
  DELAY: {
    stagger: 100,
    section: 500,
    initial: 0,
  },
  
  // Performance thresholds
  PERFORMANCE: {
    maxAnimations: 3,
    reducedMotion: false,
    gpuAcceleration: true,
  },
} as const;

// Type exports for TypeScript
export type SpringConfig = typeof ANIMATION_CONFIG.SPRING_CONFIG;
export type Duration = typeof ANIMATION_CONFIG.DURATION;
export type Easing = typeof ANIMATION_CONFIG.EASING;
