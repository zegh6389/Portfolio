"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { performanceMonitor, AnimationPriority } from "@/lib/animation-performance";
import { getGlobalAnimationQueue } from "@/lib/animation-queue";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  color: string;
}

interface OptimizedParticleFieldProps {
  particleCount?: number;
  className?: string;
  colors?: string[];
  minSize?: number;
  maxSize?: number;
  minDuration?: number;
  maxDuration?: number;
  enableGlow?: boolean;
  priority?: AnimationPriority;
}

/**
 * Optimized particle field with adaptive performance
 * Automatically adjusts particle count and effects based on device performance
 */
export default function OptimizedParticleField({
  particleCount: baseparticleCount = 30,
  className = "",
  colors = ["primary/10", "purple-600/10", "pink-600/10"],
  minSize = 4,
  maxSize = 8,
  minDuration = 15,
  maxDuration = 25,
  enableGlow = true,
  priority = AnimationPriority.LOW,
}: OptimizedParticleFieldProps) {
  const [mounted, setMounted] = useState(false);
  const [qualityLevel, setQualityLevel] = useState<'ultra' | 'high' | 'medium' | 'low' | 'minimal'>('high');
  const [actualParticleCount, setActualParticleCount] = useState(baseparticleCount);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const animationQueue = getGlobalAnimationQueue();

  // Adjust particle count based on quality level
  useEffect(() => {
    const unsubscribe = performanceMonitor.subscribe((metrics) => {
      const quality = performanceMonitor.getQualityLevel();
      setQualityLevel(quality);
      
      // Dynamically adjust particle count
      let adjustedCount = baseparticleCount;
      switch (quality) {
        case 'minimal':
          adjustedCount = Math.min(5, Math.floor(baseparticleCount * 0.2));
          break;
        case 'low':
          adjustedCount = Math.min(10, Math.floor(baseparticleCount * 0.4));
          break;
        case 'medium':
          adjustedCount = Math.min(15, Math.floor(baseparticleCount * 0.6));
          break;
        case 'high':
          adjustedCount = Math.min(25, Math.floor(baseparticleCount * 0.8));
          break;
        case 'ultra':
          adjustedCount = baseparticleCount;
          break;
      }
      
      setActualParticleCount(adjustedCount);
    });

    return unsubscribe;
  }, [baseparticleCount]);

  // Intersection observer for viewport-based rendering
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate particles with deterministic positions
  const particles = useMemo(() => {
    if (prefersReducedMotion) return [];
    
    return Array.from({ length: actualParticleCount }, (_, i) => {
      // Use golden ratio for better distribution
      const goldenRatio = (1 + Math.sqrt(5)) / 2;
      const angle = i * goldenRatio * 2 * Math.PI;
      const radius = Math.sqrt(i / actualParticleCount) * 50;
      
      const x = 50 + radius * Math.cos(angle);
      const y = 50 + radius * Math.sin(angle);
      
      return {
        id: i,
        x: x % 100,
        y: y % 100,
        size: minSize + (i % 3) * ((maxSize - minSize) / 3),
        duration: minDuration + (i % 5) * ((maxDuration - minDuration) / 5),
        delay: (i % 10) * 0.3,
        opacity: 0.3 + (i % 3) * 0.2,
        color: colors[i % colors.length],
      };
    });
  }, [actualParticleCount, colors, minSize, maxSize, minDuration, maxDuration, prefersReducedMotion]);

  // Don't render until mounted and visible
  if (!mounted || !isVisible || prefersReducedMotion) {
    return <div ref={containerRef} className={className} />;
  }

  // Render particles based on quality level
  const shouldRenderGlow = enableGlow && (qualityLevel === 'ultra' || qualityLevel === 'high');
  const shouldUseBlur = qualityLevel !== 'minimal' && qualityLevel !== 'low';

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <AnimatePresence mode="popLayout">
        {particles.map((particle) => (
          <ParticleElement
            key={particle.id}
            particle={particle}
            shouldRenderGlow={shouldRenderGlow}
            shouldUseBlur={shouldUseBlur}
            qualityLevel={qualityLevel}
            priority={priority}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

/**
 * Individual particle element with optimized rendering
 */
function ParticleElement({
  particle,
  shouldRenderGlow,
  shouldUseBlur,
  qualityLevel,
  priority,
}: {
  particle: Particle;
  shouldRenderGlow: boolean;
  shouldUseBlur: boolean;
  qualityLevel: string;
  priority: AnimationPriority;
}) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    // Queue the animation
    const queue = getGlobalAnimationQueue();
    
    queue.add({
      id: `particle-${particle.id}`,
      priority,
      execute: () => {
        setShouldAnimate(true);
      },
      duration: 100,
    });
  }, [particle.id, priority]);

  if (!shouldAnimate) {
    return null;
  }

  // Simplified animation for lower quality levels
  const animationProps = qualityLevel === 'minimal' || qualityLevel === 'low'
    ? {
        animate: {
          y: [-10, -50],
          opacity: [0, particle.opacity, 0],
        },
        transition: {
          duration: particle.duration,
          repeat: Infinity,
          delay: particle.delay,
          ease: "linear",
        },
      }
    : {
        animate: {
          y: [-20, -100],
          x: [0, Math.sin(particle.id) * 20, 0],
          opacity: [0, particle.opacity, particle.opacity * 0.5, 0],
          scale: [0.8, 1, 0.9],
        },
        transition: {
          duration: particle.duration,
          repeat: Infinity,
          delay: particle.delay,
          ease: "easeInOut",
        },
      };

  return (
    <motion.div
      ref={elementRef}
      className={`absolute rounded-full ${shouldUseBlur ? 'blur-[1px]' : ''}`}
      style={{
        left: `${particle.x}%`,
        top: `${particle.y}%`,
        width: particle.size,
        height: particle.size,
        background: `radial-gradient(circle, rgba(var(--${particle.color}), ${particle.opacity}) 0%, transparent 70%)`,
        willChange: qualityLevel === 'ultra' ? 'transform, opacity' : 'auto',
      }}
      initial={{ opacity: 0, y: 0 }}
      exit={{ opacity: 0, scale: 0 }}
      {...animationProps}
    >
      {shouldRenderGlow && (
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(var(--${particle.color}), 0.3) 0%, transparent 50%)`,
            filter: 'blur(2px)',
            transform: 'scale(1.5)',
          }}
        />
      )}
    </motion.div>
  );
}

/**
 * Canvas-based particle field for maximum performance
 * Use this for backgrounds with many particles
 */
export function CanvasParticleField({
  particleCount = 100,
  className = "",
  colors = ["#8b5cf6", "#ec4899", "#3b82f6"],
}: {
  particleCount?: number;
  className?: string;
  colors?: string[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    opacity: number;
  }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    particlesRef.current = Array.from({ length: particleCount }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -Math.random() * 0.5 - 0.5,
      size: Math.random() * 3 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.5 + 0.2,
    }));

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.y < -10) {
          particle.y = canvas.height + 10;
          particle.x = Math.random() * canvas.width;
        }
        if (particle.x < -10) particle.x = canvas.width + 10;
        if (particle.x > canvas.width + 10) particle.x = -10;

        // Draw particle
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation only if performance allows
    const quality = performanceMonitor.getQualityLevel();
    if (quality !== 'minimal') {
      animate();
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particleCount, colors]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ width: '100%', height: '100%' }}
      aria-hidden="true"
    />
  );
}
