/**
 * Advanced animation performance monitoring and optimization system
 */

// Performance metrics tracking
interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  droppedFrames: number;
  memoryUsage: number;
  animationCount: number;
}

// Quality levels for adaptive performance
export type QualityLevel = 'ultra' | 'high' | 'medium' | 'low' | 'minimal';

// Animation priority levels
export enum AnimationPriority {
  CRITICAL = 0,  // Must animate (e.g., page transitions)
  HIGH = 1,      // Important UX (e.g., button feedback)
  MEDIUM = 2,    // Nice to have (e.g., decorative animations)
  LOW = 3,       // Optional (e.g., background effects)
}

/**
 * Performance monitor with adaptive quality adjustment
 */
export class AnimationPerformanceMonitor {
  private static instance: AnimationPerformanceMonitor;
  private frameTimings: number[] = [];
  private lastFrameTime: number = 0;
  private droppedFrames: number = 0;
  private qualityLevel: QualityLevel = 'high';
  private animationBudget: number = 16.67; // Target 60fps
  private activeAnimations: Set<string> = new Set();
  private rafId: number | null = null;
  private callbacks: Set<(metrics: PerformanceMetrics) => void> = new Set();

  private constructor() {
    if (typeof window !== 'undefined') {
      this.startMonitoring();
    }
  }

  static getInstance(): AnimationPerformanceMonitor {
    if (!AnimationPerformanceMonitor.instance) {
      AnimationPerformanceMonitor.instance = new AnimationPerformanceMonitor();
    }
    return AnimationPerformanceMonitor.instance;
  }

  private startMonitoring(): void {
    const measure = (timestamp: number) => {
      if (this.lastFrameTime) {
        const frameTime = timestamp - this.lastFrameTime;
        this.frameTimings.push(frameTime);
        
        // Keep only last 60 frames
        if (this.frameTimings.length > 60) {
          this.frameTimings.shift();
        }

        // Detect dropped frames (> 33ms for 30fps threshold)
        if (frameTime > 33) {
          this.droppedFrames++;
        }

        // Adjust quality every 60 frames
        if (this.frameTimings.length === 60) {
          this.adjustQuality();
          this.notifyCallbacks();
        }
      }
      
      this.lastFrameTime = timestamp;
      this.rafId = requestAnimationFrame(measure);
    };

    this.rafId = requestAnimationFrame(measure);
  }

  private adjustQuality(): void {
    const avgFrameTime = this.getAverageFrameTime();
    const fps = 1000 / avgFrameTime;
    const droppedFrameRatio = this.droppedFrames / this.frameTimings.length;

    // Reset dropped frames counter
    this.droppedFrames = 0;

    // Determine quality level based on performance
    if (fps >= 55 && droppedFrameRatio < 0.05) {
      this.qualityLevel = 'ultra';
      this.animationBudget = 16.67;
    } else if (fps >= 50 && droppedFrameRatio < 0.1) {
      this.qualityLevel = 'high';
      this.animationBudget = 20;
    } else if (fps >= 40 && droppedFrameRatio < 0.15) {
      this.qualityLevel = 'medium';
      this.animationBudget = 25;
    } else if (fps >= 30) {
      this.qualityLevel = 'low';
      this.animationBudget = 33.33;
    } else {
      this.qualityLevel = 'minimal';
      this.animationBudget = 50;
    }
  }

  getAverageFrameTime(): number {
    if (this.frameTimings.length === 0) return 16.67;
    const sum = this.frameTimings.reduce((a, b) => a + b, 0);
    return sum / this.frameTimings.length;
  }

  getCurrentFPS(): number {
    const avgFrameTime = this.getAverageFrameTime();
    return Math.round(1000 / avgFrameTime);
  }

  getQualityLevel(): QualityLevel {
    return this.qualityLevel;
  }

  getAnimationBudget(): number {
    return this.animationBudget;
  }

  registerAnimation(id: string): void {
    this.activeAnimations.add(id);
  }

  unregisterAnimation(id: string): void {
    this.activeAnimations.delete(id);
  }

  getActiveAnimationCount(): number {
    return this.activeAnimations.size;
  }

  shouldSkipAnimation(priority: AnimationPriority): boolean {
    const maxAnimations = this.getMaxConcurrentAnimations();
    
    if (this.activeAnimations.size >= maxAnimations) {
      // Skip low priority animations when at capacity
      return priority >= AnimationPriority.MEDIUM;
    }

    // Skip animations based on quality level
    switch (this.qualityLevel) {
      case 'minimal':
        return priority > AnimationPriority.CRITICAL;
      case 'low':
        return priority > AnimationPriority.HIGH;
      case 'medium':
        return priority > AnimationPriority.MEDIUM;
      default:
        return false;
    }
  }

  private getMaxConcurrentAnimations(): number {
    switch (this.qualityLevel) {
      case 'ultra': return 10;
      case 'high': return 7;
      case 'medium': return 5;
      case 'low': return 3;
      case 'minimal': return 1;
      default: return 5;
    }
  }

  getMetrics(): PerformanceMetrics {
    return {
      fps: this.getCurrentFPS(),
      frameTime: this.getAverageFrameTime(),
      droppedFrames: this.droppedFrames,
      memoryUsage: this.getMemoryUsage(),
      animationCount: this.activeAnimations.size,
    };
  }

  private getMemoryUsage(): number {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as unknown as { memory: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      return memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    }
    return 0;
  }

  subscribe(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  private notifyCallbacks(): void {
    const metrics = this.getMetrics();
    this.callbacks.forEach(callback => callback(metrics));
  }

  destroy(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    this.callbacks.clear();
    this.activeAnimations.clear();
  }
}

/**
 * Get optimized animation configuration based on quality level
 */
export function getOptimizedAnimationConfig(quality: QualityLevel) {
  switch (quality) {
    case 'ultra':
      return {
        stiffness: 400,
        damping: 30,
        mass: 0.8,
        duration: 0.6,
        stagger: 0.05,
        particleCount: 50,
        enableBlur: true,
        enableGlow: true,
        enable3D: true,
      };
    case 'high':
      return {
        stiffness: 350,
        damping: 28,
        mass: 1,
        duration: 0.5,
        stagger: 0.07,
        particleCount: 30,
        enableBlur: true,
        enableGlow: true,
        enable3D: true,
      };
    case 'medium':
      return {
        stiffness: 300,
        damping: 25,
        mass: 1.2,
        duration: 0.4,
        stagger: 0.1,
        particleCount: 20,
        enableBlur: false,
        enableGlow: true,
        enable3D: true,
      };
    case 'low':
      return {
        stiffness: 250,
        damping: 20,
        mass: 1.5,
        duration: 0.3,
        stagger: 0.15,
        particleCount: 10,
        enableBlur: false,
        enableGlow: false,
        enable3D: false,
      };
    case 'minimal':
      return {
        stiffness: 200,
        damping: 15,
        mass: 2,
        duration: 0.2,
        stagger: 0.2,
        particleCount: 5,
        enableBlur: false,
        enableGlow: false,
        enable3D: false,
      };
  }
}

/**
 * Create optimized spring configuration
 */
export function createOptimizedSpring(
  base: { stiffness: number; damping: number },
  quality: QualityLevel
) {
  const config = getOptimizedAnimationConfig(quality);
  return {
    type: 'spring' as const,
    stiffness: Math.min(base.stiffness, config.stiffness),
    damping: Math.max(base.damping, config.damping),
    mass: config.mass,
  };
}

/**
 * Viewport-based animation observer with performance awareness
 */
export class ViewportAnimationObserver {
  private observer: IntersectionObserver | null = null;
  private elements: Map<Element, (isVisible: boolean) => void> = new Map();
  private monitor: AnimationPerformanceMonitor;

  constructor(options?: IntersectionObserverInit) {
    this.monitor = AnimationPerformanceMonitor.getInstance();
    
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const callback = this.elements.get(entry.target);
          if (callback) {
            // Only trigger animations if performance allows
            const quality = this.monitor.getQualityLevel();
            if (quality === 'minimal' && !entry.isIntersecting) {
              return; // Skip exit animations on low-end devices
            }
            callback(entry.isIntersecting);
          }
        });
      }, {
        threshold: options?.threshold || 0.1,
        rootMargin: options?.rootMargin || '50px',
        ...options,
      });
    }
  }

  observe(element: Element, callback: (isVisible: boolean) => void): void {
    if (this.observer) {
      this.elements.set(element, callback);
      this.observer.observe(element);
    }
  }

  unobserve(element: Element): void {
    if (this.observer) {
      this.observer.unobserve(element);
      this.elements.delete(element);
    }
  }

  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.elements.clear();
    }
  }
}

/**
 * Will-change manager for optimal GPU usage
 */
export class WillChangeManager {
  private elements: Map<HTMLElement, Set<string>> = new Map();
  private timeouts: Map<HTMLElement, NodeJS.Timeout> = new Map();

  add(element: HTMLElement, properties: string[], duration: number = 1000): void {
    const existing = this.elements.get(element) || new Set();
    properties.forEach(prop => existing.add(prop));
    this.elements.set(element, existing);
    
    // Apply will-change
    element.style.willChange = Array.from(existing).join(', ');
    
    // Clear existing timeout
    const existingTimeout = this.timeouts.get(element);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    // Set new timeout to remove will-change
    const timeout = setTimeout(() => {
      this.remove(element);
    }, duration);
    
    this.timeouts.set(element, timeout);
  }

  remove(element: HTMLElement): void {
    element.style.willChange = 'auto';
    this.elements.delete(element);
    
    const timeout = this.timeouts.get(element);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(element);
    }
  }

  clear(): void {
    this.elements.forEach((_, element) => {
      element.style.willChange = 'auto';
    });
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.elements.clear();
    this.timeouts.clear();
  }
}

// Export singleton instances
export const performanceMonitor = AnimationPerformanceMonitor.getInstance();
export const willChangeManager = new WillChangeManager();
