import { ANIMATION_CONFIG } from './constants/animation';

/**
 * Utility functions for animations and performance optimization
 */

// Check if user prefers reduced motion
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
}

// Throttle function for scroll/resize events
export function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  delay: number = ANIMATION_CONFIG.PERFORMANCE.scrollThrottle
): T {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;

  return ((...args: Parameters<T>) => {
    const currentTime = Date.now();

    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  }) as T;
}

// Debounce function for resize events
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  delay: number = ANIMATION_CONFIG.PERFORMANCE.resizeDebounce
): T {
  let timeoutId: NodeJS.Timeout | null = null;

  return ((...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}

// Check if device is low-end based on various factors
export function isLowEndDevice(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for reduced motion preference
  if (prefersReducedMotion()) return true;

  // Check connection speed
  const connection = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (connection?.saveData || connection?.effectiveType === '2g') {
    return true;
  }

  // Check device memory (Chrome only)
  const deviceMemory = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
  if (deviceMemory && deviceMemory < 4) {
    return true;
  }

  // Check hardware concurrency (number of CPU cores)
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
    return true;
  }

  return false;
}

// Get responsive animation config based on viewport
export function getResponsiveAnimationConfig() {
  if (typeof window === 'undefined') {
    return {
      particleCount: ANIMATION_CONFIG.PERFORMANCE.maxParticles,
      enableComplexAnimations: true,
    };
  }

  const width = window.innerWidth;
  const isLowEnd = isLowEndDevice();

  if (width < ANIMATION_CONFIG.breakpoints.mobile || isLowEnd) {
    return {
      particleCount: Math.floor(ANIMATION_CONFIG.PERFORMANCE.maxParticles * 0.3),
      enableComplexAnimations: false,
    };
  }

  if (width < ANIMATION_CONFIG.breakpoints.tablet) {
    return {
      particleCount: Math.floor(ANIMATION_CONFIG.PERFORMANCE.maxParticles * 0.6),
      enableComplexAnimations: true,
    };
  }

  return {
    particleCount: ANIMATION_CONFIG.PERFORMANCE.maxParticles,
    enableComplexAnimations: true,
  };
}

// Generate GPU-optimized transform string
export function getGPUTransform(
  x: number = 0,
  y: number = 0,
  z: number = 0,
  scale: number = 1,
  rotate: number = 0
): string {
  return `translate3d(${x}px, ${y}px, ${z}px) scale(${scale}) rotate(${rotate}deg)`;
}

// Request animation frame with fallback
export function raf(callback: FrameRequestCallback): number {
  if (typeof window !== 'undefined' && window.requestAnimationFrame) {
    return window.requestAnimationFrame(callback);
  }
  return setTimeout(callback, 16) as unknown as number;
}

// Cancel animation frame with fallback
export function cancelRaf(id: number): void {
  if (typeof window !== 'undefined' && window.cancelAnimationFrame) {
    window.cancelAnimationFrame(id);
  } else {
    clearTimeout(id);
  }
}

// Batch DOM updates for better performance
export class DOMBatcher {
  private reads: (() => void)[] = [];
  private writes: (() => void)[] = [];
  private scheduled = false;

  read(fn: () => void) {
    this.reads.push(fn);
    this.schedule();
  }

  write(fn: () => void) {
    this.writes.push(fn);
    this.schedule();
  }

  private schedule() {
    if (this.scheduled) return;
    this.scheduled = true;

    raf(() => {
      const reads = this.reads.splice(0);
      const writes = this.writes.splice(0);

      reads.forEach(fn => fn());
      writes.forEach(fn => fn());

      this.scheduled = false;
    });
  }
}

// Create a singleton instance
export const domBatcher = new DOMBatcher();

// Intersection Observer factory for lazy loading
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !window.IntersectionObserver) {
    return null;
  }

  return new IntersectionObserver(callback, {
    threshold: ANIMATION_CONFIG.PERFORMANCE.intersectionThreshold,
    ...options,
  });
}

// Performance monitoring utility
export class AnimationPerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;

  start() {
    this.measure();
  }

  private measure = () => {
    const now = performance.now();
    const delta = now - this.lastTime;

    if (delta >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / delta);
      this.frameCount = 0;
      this.lastTime = now;

      // Log warning if FPS drops below 30
      if (this.fps < 30 && process.env.NODE_ENV === 'development') {
        console.warn(`Low FPS detected: ${this.fps}`);
      }
    }

    this.frameCount++;
    raf(this.measure);
  };

  getFPS() {
    return this.fps;
  }
}

// Memoize expensive calculations
export function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args) as ReturnType<T>;
    cache.set(key, result);
    return result;
  }) as T;
}

// Clamp value between min and max
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Linear interpolation
export function lerp(start: number, end: number, progress: number): number {
  return start + (end - start) * progress;
}

// Map value from one range to another
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}
