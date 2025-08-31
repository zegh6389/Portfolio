"use client";

import { Suspense, lazy, useEffect, useState, useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { 
  Text, 
  Box, 
  OrbitControls, 
  PerspectiveCamera,
  useTexture,
  Preload,
  AdaptiveDpr,
  AdaptiveEvents,
  PerformanceMonitor as R3FPerformanceMonitor,
} from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Download, Eye, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { performanceMonitor, AnimationPriority } from "@/lib/animation-performance";
import { getGlobalAnimationQueue } from "@/lib/animation-queue";

// Lazy load heavy 3D components
const FloatingElements = lazy(() => import('./Resume3DElements').then(module => ({ 
  default: module.FloatingElements 
})));

interface OptimizedResume3DProps {
  className?: string;
  enableEffects?: boolean;
  quality?: 'auto' | 'high' | 'medium' | 'low';
}

/**
 * Loading fallback component
 */
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-sm text-muted-foreground">Loading 3D Resume...</p>
      </div>
    </div>
  );
}

/**
 * Error fallback component
 */
function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <AlertCircle className="w-8 h-8 mx-auto mb-4 text-destructive" />
        <p className="text-sm text-muted-foreground mb-4">Failed to load 3D content</p>
        <Button onClick={onRetry} size="sm" variant="outline">
          Retry
        </Button>
      </div>
    </div>
  );
}

/**
 * Optimized 3D Document Component
 */
function Document3D({ quality }: { quality: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  
  // Optimize texture loading
  const textureProps = useMemo(() => {
    if (quality === 'low') {
      return { anisotropy: 1, minFilter: THREE.NearestFilter };
    }
    return { anisotropy: 4, minFilter: THREE.LinearMipMapLinearFilter };
  }, [quality]);

  // Simplified animation for reduced motion
  useFrame((state) => {
    if (!meshRef.current || prefersReducedMotion) return;
    
    if (quality !== 'low') {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
    
    if (hovered && quality === 'high') {
      meshRef.current.scale.lerp(new THREE.Vector3(1.05, 1.05, 1.05), 0.1);
    } else {
      meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
    }
  });

  // Simplified geometry for lower quality
  const geometryArgs: [number, number, number] = quality === 'low' 
    ? [2, 2.8, 0.05] 
    : [2, 2.8, 0.1];
  
  const geometrySegments = quality === 'low' ? 1 : 2;

  return (
    <group>
      <Box
        ref={meshRef}
        args={geometryArgs}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color="#ffffff"
          emissive="#1a1a2e"
          emissiveIntensity={0.1}
          roughness={0.4}
          metalness={0.1}
        />
      </Box>
      
      {/* Text on document - only render in higher quality */}
      {quality !== 'low' && (
        <Text
          position={[0, 0.5, 0.06]}
          fontSize={0.15}
          color="#333333"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-medium.woff"
        >
          Resume
        </Text>
      )}
    </group>
  );
}

/**
 * Optimized lighting setup
 */
function OptimizedLighting({ quality }: { quality: string }) {
  const lightIntensity = quality === 'low' ? 0.8 : 1;
  const enableShadows = quality === 'high';

  return (
    <>
      <ambientLight intensity={lightIntensity * 0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={lightIntensity}
        castShadow={enableShadows}
        shadow-mapSize={enableShadows ? [1024, 1024] : [512, 512]}
      />
      {quality !== 'low' && (
        <pointLight position={[-10, -10, -5]} intensity={lightIntensity * 0.3} />
      )}
    </>
  );
}

/**
 * Main Optimized Resume 3D Component
 */
export default function OptimizedResume3D({
  className = "",
  enableEffects = true,
  quality: propQuality = 'auto',
}: OptimizedResume3DProps) {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState(false);
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('medium');
  const [showCanvas, setShowCanvas] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Auto-detect quality based on performance
  useEffect(() => {
    if (propQuality === 'auto') {
      const unsubscribe = performanceMonitor.subscribe(() => {
        const level = performanceMonitor.getQualityLevel();
        switch (level) {
          case 'ultra':
          case 'high':
            setQuality('high');
            break;
          case 'medium':
            setQuality('medium');
            break;
          default:
            setQuality('low');
        }
      });
      return unsubscribe;
    } else {
      setQuality(propQuality as 'high' | 'medium' | 'low');
    }
  }, [propQuality]);

  // Intersection observer for lazy loading
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
      }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDownload = () => {
    // Queue download animation
    const queue = getGlobalAnimationQueue();
    queue.add({
      id: 'resume-download',
      priority: AnimationPriority.HIGH,
      execute: () => {
        // Trigger download
        const link = document.createElement('a');
        link.href = '/resume.pdf';
        link.download = 'Awais_Zegham_Resume.pdf';
        link.click();
      },
    });
  };

  const handleRetry = () => {
    setError(false);
    setShowCanvas(true);
  };

  // Don't render 3D for reduced motion preference
  if (prefersReducedMotion) {
    return (
      <section id="resume" className={`py-20 ${className}`}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold mb-8">Resume</h2>
            <div className="max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
                <FileText className="w-16 h-16 mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground mb-6">
                  Download my resume to learn more about my experience and skills
                </p>
                <div className="flex justify-center gap-4">
                  <Button onClick={handleDownload} className="gap-2">
                    <Download className="w-4 h-4" />
                    Download PDF
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/resume" className="gap-2">
                      <Eye className="w-4 h-4" />
                      View Online
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="resume" ref={containerRef} className={`py-20 relative ${className}`}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4" variant="outline">
            Interactive Resume
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Professional Experience
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore my resume in 3D or download the PDF version
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* 3D Canvas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/5 via-purple-600/5 to-pink-600/5"
          >
            {mounted && isVisible && showCanvas && !error ? (
              <Suspense fallback={<LoadingFallback />}>
                <Canvas
                  shadows={quality === 'high'}
                  dpr={quality === 'low' ? [0.5, 1] : [1, 2]}
                  gl={{
                    powerPreference: quality === 'low' ? 'low-power' : 'high-performance',
                    antialias: quality !== 'low',
                    alpha: true,
                  }}
                  onError={() => setError(true)}
                >
                  <AdaptiveDpr pixelated={quality === 'low'} />
                  <AdaptiveEvents />
                  
                  {quality === 'high' && (
                    <R3FPerformanceMonitor
                      onDecline={() => setQuality('medium')}
                      flipflops={3}
                      factor={0.5}
                    />
                  )}
                  
                  <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                  <OrbitControls
                    enablePan={false}
                    enableZoom={quality !== 'low'}
                    maxPolarAngle={Math.PI / 2}
                    minPolarAngle={Math.PI / 3}
                    autoRotate={quality === 'high' && enableEffects}
                    autoRotateSpeed={0.5}
                  />
                  
                  <OptimizedLighting quality={quality} />
                  <Document3D quality={quality} />
                  
                  {quality === 'high' && enableEffects && (
                    <Suspense fallback={null}>
                      <FloatingElements />
                    </Suspense>
                  )}
                  
                  <Preload all />
                </Canvas>
              </Suspense>
            ) : error ? (
              <ErrorFallback onRetry={handleRetry} />
            ) : (
              <LoadingFallback />
            )}

            {/* Quality indicator */}
            {mounted && (
              <div className="absolute top-4 right-4 z-10">
                <Badge variant="secondary" className="bg-black/50 backdrop-blur-sm">
                  {quality.toUpperCase()} Quality
                </Badge>
              </div>
            )}
          </motion.div>

          {/* Resume Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">Full Stack Developer</h3>
              <p className="text-muted-foreground">
                Experienced in building scalable web applications with modern technologies.
                Passionate about creating intuitive user experiences and solving complex problems.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-lg font-semibold">Key Highlights</h4>
              <ul className="space-y-2">
                {[
                  "5+ years of professional development experience",
                  "Expert in React, Next.js, and TypeScript",
                  "Strong background in UI/UX design",
                  "Experience with cloud platforms (AWS, Vercel)",
                  "Proven track record of delivering projects on time",
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-sm">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button onClick={handleDownload} size="lg" className="gap-2">
                <Download className="w-4 h-4" />
                Download Resume
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="/resume" className="gap-2">
                  <Eye className="w-4 h-4" />
                  View Online
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
