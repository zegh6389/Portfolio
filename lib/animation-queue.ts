/**
 * Animation Queue System for managing and prioritizing animations
 * Prevents animation overlap and manages execution order
 */

import { AnimationPriority, performanceMonitor } from './animation-performance';

export interface AnimationQueueItem {
  id: string;
  priority: AnimationPriority;
  execute: () => Promise<void> | void;
  cleanup?: () => void;
  duration?: number;
  timestamp?: number;
}

export interface QueueOptions {
  maxConcurrent?: number;
  autoStart?: boolean;
  frameBudget?: number;
}

/**
 * Animation Queue for managing animation execution order and concurrency
 */
export class AnimationQueue {
  private queue: AnimationQueueItem[] = [];
  private executing: Map<string, AnimationQueueItem> = new Map();
  private maxConcurrent: number;
  private isRunning: boolean = false;
  private frameBudget: number;
  private frameStartTime: number = 0;
  private rafId: number | null = null;
  private completedAnimations: Set<string> = new Set();

  constructor(options: QueueOptions = {}) {
    this.maxConcurrent = options.maxConcurrent || 3;
    this.frameBudget = options.frameBudget || 16.67; // 60fps target
    
    if (options.autoStart !== false) {
      this.start();
    }
  }

  /**
   * Add an animation to the queue
   */
  add(item: AnimationQueueItem): void {
    // Skip if already completed or executing
    if (this.completedAnimations.has(item.id) || this.executing.has(item.id)) {
      return;
    }

    // Add timestamp for FIFO within same priority
    item.timestamp = performance.now();
    
    // Insert in priority order
    const insertIndex = this.queue.findIndex(
      (queueItem) => queueItem.priority > item.priority
    );
    
    if (insertIndex === -1) {
      this.queue.push(item);
    } else {
      this.queue.splice(insertIndex, 0, item);
    }

    // Register with performance monitor
    performanceMonitor.registerAnimation(item.id);
    
    // Process queue if running
    if (this.isRunning) {
      this.processQueue();
    }
  }

  /**
   * Add multiple animations at once
   */
  addBatch(items: AnimationQueueItem[]): void {
    items.forEach(item => this.add(item));
  }

  /**
   * Start processing the queue
   */
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.processQueue();
  }

  /**
   * Pause queue processing
   */
  pause(): void {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Resume queue processing
   */
  resume(): void {
    this.start();
  }

  /**
   * Clear the queue
   */
  clear(priority?: AnimationPriority): void {
    if (priority !== undefined) {
      // Clear only items with specific priority
      this.queue = this.queue.filter(item => {
        if (item.priority === priority) {
          performanceMonitor.unregisterAnimation(item.id);
          return false;
        }
        return true;
      });
    } else {
      // Clear all queued items
      this.queue.forEach(item => {
        performanceMonitor.unregisterAnimation(item.id);
      });
      this.queue = [];
    }
  }

  /**
   * Process the animation queue
   */
  private processQueue(): void {
    if (!this.isRunning) return;

    const process = () => {
      this.frameStartTime = performance.now();
      
      // Check if we can execute more animations
      while (
        this.queue.length > 0 &&
        this.executing.size < this.maxConcurrent &&
        this.hasFrameBudget()
      ) {
        const item = this.queue.shift();
        if (!item) break;

        // Check if we should skip based on performance
        if (performanceMonitor.shouldSkipAnimation(item.priority)) {
          performanceMonitor.unregisterAnimation(item.id);
          continue;
        }

        this.executeAnimation(item);
      }

      // Continue processing if there are items in queue or executing
      if (this.queue.length > 0 || this.executing.size > 0) {
        this.rafId = requestAnimationFrame(process);
      } else {
        this.rafId = null;
      }
    };

    // Start processing on next frame
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(process);
    }
  }

  /**
   * Execute a single animation
   */
  private async executeAnimation(item: AnimationQueueItem): Promise<void> {
    this.executing.set(item.id, item);

    try {
      // Execute the animation
      const result = item.execute();
      
      // Handle both sync and async animations
      if (result instanceof Promise) {
        await result;
      }

      // Wait for animation duration if specified
      if (item.duration) {
        await this.delay(item.duration);
      }
    } catch (error) {
      console.error(`Animation ${item.id} failed:`, error);
    } finally {
      // Cleanup
      if (item.cleanup) {
        try {
          item.cleanup();
        } catch (error) {
          console.error(`Animation ${item.id} cleanup failed:`, error);
        }
      }

      // Mark as completed
      this.executing.delete(item.id);
      this.completedAnimations.add(item.id);
      performanceMonitor.unregisterAnimation(item.id);

      // Clean up completed set periodically
      if (this.completedAnimations.size > 100) {
        this.completedAnimations.clear();
      }
    }
  }

  /**
   * Check if we have frame budget remaining
   */
  private hasFrameBudget(): boolean {
    const elapsed = performance.now() - this.frameStartTime;
    const qualityLevel = performanceMonitor.getQualityLevel();
    
    // Adjust frame budget based on quality level
    let adjustedBudget = this.frameBudget;
    switch (qualityLevel) {
      case 'minimal':
        adjustedBudget = 8; // Very strict budget
        break;
      case 'low':
        adjustedBudget = 12;
        break;
      case 'medium':
        adjustedBudget = 16;
        break;
      default:
        adjustedBudget = this.frameBudget;
    }
    
    return elapsed < adjustedBudget;
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get queue status
   */
  getStatus(): {
    queued: number;
    executing: number;
    maxConcurrent: number;
    isRunning: boolean;
  } {
    return {
      queued: this.queue.length,
      executing: this.executing.size,
      maxConcurrent: this.maxConcurrent,
      isRunning: this.isRunning,
    };
  }

  /**
   * Update max concurrent animations
   */
  setMaxConcurrent(max: number): void {
    this.maxConcurrent = max;
    if (this.isRunning) {
      this.processQueue();
    }
  }

  /**
   * Destroy the queue
   */
  destroy(): void {
    this.pause();
    this.clear();
    this.executing.forEach(item => {
      if (item.cleanup) {
        item.cleanup();
      }
      performanceMonitor.unregisterAnimation(item.id);
    });
    this.executing.clear();
    this.completedAnimations.clear();
  }
}

/**
 * Global animation queue instance
 */
let globalQueue: AnimationQueue | null = null;

export function getGlobalAnimationQueue(): AnimationQueue {
  if (!globalQueue) {
    globalQueue = new AnimationQueue({
      maxConcurrent: 3,
      autoStart: true,
    });

    // Adjust concurrency based on performance
    performanceMonitor.subscribe((metrics) => {
      if (metrics.fps < 30) {
        globalQueue?.setMaxConcurrent(1);
      } else if (metrics.fps < 45) {
        globalQueue?.setMaxConcurrent(2);
      } else {
        globalQueue?.setMaxConcurrent(3);
      }
    });
  }
  return globalQueue;
}

/**
 * Stagger animation helper
 */
export function staggerAnimations(
  animations: Array<() => void | Promise<void>>,
  options: {
    stagger?: number;
    priority?: AnimationPriority;
    batchSize?: number;
  } = {}
): void {
  const {
    stagger = 50,
    priority = AnimationPriority.MEDIUM,
    batchSize = 5,
  } = options;

  const queue = getGlobalAnimationQueue();
  
  animations.forEach((animation, index) => {
    const batchIndex = Math.floor(index / batchSize);
    const delay = index * stagger;
    
    queue.add({
      id: `stagger-${Date.now()}-${index}`,
      priority: priority + (batchIndex * 0.1), // Slightly lower priority for later batches
      execute: async () => {
        await new Promise(resolve => setTimeout(resolve, delay));
        return animation();
      },
    });
  });
}

/**
 * Create a debounced animation
 */
export function createDebouncedAnimation(
  id: string,
  animation: () => void | Promise<void>,
  delay: number = 100,
  priority: AnimationPriority = AnimationPriority.MEDIUM
): () => void {
  let timeoutId: NodeJS.Timeout | null = null;
  const queue = getGlobalAnimationQueue();

  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      queue.add({
        id,
        priority,
        execute: animation,
      });
      timeoutId = null;
    }, delay);
  };
}

/**
 * Create a throttled animation
 */
export function createThrottledAnimation(
  id: string,
  animation: () => void | Promise<void>,
  limit: number = 100,
  priority: AnimationPriority = AnimationPriority.HIGH
): () => void {
  let lastRun = 0;
  let timeoutId: NodeJS.Timeout | null = null;
  const queue = getGlobalAnimationQueue();

  return () => {
    const now = Date.now();
    const timeSinceLastRun = now - lastRun;

    if (timeSinceLastRun >= limit) {
      lastRun = now;
      queue.add({
        id,
        priority,
        execute: animation,
      });
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        lastRun = Date.now();
        queue.add({
          id,
          priority,
          execute: animation,
        });
        timeoutId = null;
      }, limit - timeSinceLastRun);
    }
  };
}
