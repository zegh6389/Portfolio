"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { Moon, Sun, Menu, X, Home, User, Briefcase, Mail, Code2 } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { performanceMonitor, AnimationPriority } from "@/lib/animation-performance";
import { getGlobalAnimationQueue } from "@/lib/animation-queue";
import { ANIMATION_CONFIG } from "@/lib/constants/animation";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: "#home", label: "Home", icon: Home },
  { href: "#skills", label: "Skills", icon: Code2 },
  { href: "#resume", label: "Resume", icon: User },
  { href: "#projects", label: "Projects", icon: Briefcase },
  { href: "#contact", label: "Contact", icon: Mail },
];

/**
 * Optimized Magnetic Button Component
 * Only applies effect when performance allows
 */
function OptimizedMagneticButton({ 
  children, 
  className,
  disabled = false 
}: { 
  children: React.ReactNode; 
  className?: string;
  disabled?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [enableEffect, setEnableEffect] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, ANIMATION_CONFIG.SPRING_CONFIG.smooth);
  const springY = useSpring(y, ANIMATION_CONFIG.SPRING_CONFIG.smooth);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
    
    // Subscribe to performance changes
    const unsubscribe = performanceMonitor.subscribe(() => {
      const quality = performanceMonitor.getQualityLevel();
      setEnableEffect(quality !== 'low' && !prefersReducedMotion);
    });
    
    return unsubscribe;
  }, [prefersReducedMotion]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current || !mounted || !enableEffect || disabled) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = (e.clientX - centerX) * ANIMATION_CONFIG.MAGNETIC_STRENGTH;
    const distanceY = (e.clientY - centerY) * ANIMATION_CONFIG.MAGNETIC_STRENGTH;
    
    x.set(distanceX);
    y.set(distanceY);
  }, [x, y, mounted, enableEffect, disabled]);

  const handleMouseLeave = useCallback(() => {
    if (!mounted || !enableEffect) return;
    x.set(0);
    y.set(0);
  }, [x, y, mounted, enableEffect]);

  if (!mounted || !enableEffect || disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Optimized Header Component with Performance Monitoring
 */
export default function OptimizedHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("#home");
  const [mounted, setMounted] = useState(false);
  const [animationQuality, setAnimationQuality] = useState<'high' | 'medium' | 'low'>('high');
  
  const { theme, setTheme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const animationQueue = useMemo(() => getGlobalAnimationQueue(), []);
  
  // Optimized scroll progress tracking
  const rawScrollProgress = useMotionValue(0);
  const smoothScrollProgress = useSpring(rawScrollProgress, {
    stiffness: animationQuality === 'low' ? 400 : 160,
    damping: animationQuality === 'low' ? 40 : 30,
    mass: 0.35,
  });

  // Performance monitoring
  useEffect(() => {
    const unsubscribe = performanceMonitor.subscribe(() => {
      const quality = performanceMonitor.getQualityLevel();
      setAnimationQuality(
        quality === 'ultra' || quality === 'high' ? 'high' :
        quality === 'medium' ? 'medium' : 'low'
      );
    });
    
    return unsubscribe;
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Optimized scroll handling with RAF and throttling
  useEffect(() => {
    if (!mounted) return;

    let rafId: number | null = null;
    let lastScrollY = 0;
    let lastUpdateTime = 0;
    
    const sectionIds = navItems.map(n => n.href.slice(1));
    let sections: HTMLElement[] = [];
    
    const collectSections = () => {
      sections = sectionIds
        .map(id => document.getElementById(id))
        .filter((el): el is HTMLElement => !!el);
    };
    
    collectSections();
    // Retry for dynamically loaded content
    const retryTimeouts = [300, 800, 1500].map(delay => 
      setTimeout(collectSections, delay)
    );

    const update = (timestamp: number) => {
      // Throttle updates based on quality
      const throttleMs = animationQuality === 'low' ? 100 : 
                        animationQuality === 'medium' ? 50 : 16;
      
      if (timestamp - lastUpdateTime < throttleMs) {
        rafId = requestAnimationFrame(update);
        return;
      }
      
      lastUpdateTime = timestamp;
      const scrollY = window.scrollY;
      
      // Only update if scroll changed significantly
      if (Math.abs(scrollY - lastScrollY) > 1) {
        lastScrollY = scrollY;
        
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progressRatio = documentHeight > 0 ? Math.min(scrollY / documentHeight, 1) : 0;
        rawScrollProgress.set(progressRatio);
        setIsScrolled(scrollY > ANIMATION_CONFIG.SCROLL_THRESHOLD);

        // Update active section
        const HEADER_OFFSET = 120;
        const position = scrollY + HEADER_OFFSET;
        let current = '#home';
        
        for (const sec of sections) {
          if (sec.offsetTop <= position) {
            current = `#${sec.id}`;
          } else {
            break;
          }
        }
        
        if (current !== activeSection) {
          setActiveSection(current);
        }
      }
      
      rafId = requestAnimationFrame(update);
    };

    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    };

    // Initial update
    rafId = requestAnimationFrame(update);
    
    // Use passive listeners for better performance
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
      retryTimeouts.forEach(clearTimeout);
    };
  }, [mounted, rawScrollProgress, activeSection, animationQuality]);

  // Optimized smooth scrolling with animation queue
  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    
    animationQueue.add({
      id: `nav-scroll-${href}`,
      priority: AnimationPriority.HIGH,
      execute: () => {
        const element = document.querySelector(href);
        if (element) {
          const headerHeight = 80;
          const targetTop = (element as HTMLElement).getBoundingClientRect().top + 
                          window.scrollY - headerHeight;
          
          // Use native smooth scrolling when available
          if ('scrollBehavior' in document.documentElement.style && !prefersReducedMotion) {
            window.scrollTo({ top: targetTop, behavior: 'smooth' });
          } else {
            window.scrollTo(0, targetTop);
          }
          
          setIsMenuOpen(false);
        }
      },
    });
  }, [animationQueue, prefersReducedMotion]);

  const toggleTheme = useCallback(() => {
    animationQueue.add({
      id: 'theme-toggle',
      priority: AnimationPriority.CRITICAL,
      execute: () => {
        setTheme(theme === "dark" ? "light" : "dark");
      },
    });
  }, [theme, setTheme, animationQueue]);

  // Simplified animations for low performance
  const headerVariants = useMemo(() => ({
    scrolled: {
      backgroundColor: animationQuality === 'low' ? 'var(--background)' : undefined,
      backdropFilter: animationQuality !== 'low' ? 'blur(12px)' : undefined,
      transition: { duration: animationQuality === 'low' ? 0 : 0.3 },
    },
    default: {
      backgroundColor: 'transparent',
      backdropFilter: 'blur(0px)',
      transition: { duration: animationQuality === 'low' ? 0 : 0.3 },
    },
  }), [animationQuality]);

  return (
    <>
      {/* Scroll Progress Bar */}
      {mounted && animationQuality !== 'low' && (
        <motion.div
          aria-hidden
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-600 to-pink-600 z-[60] origin-left"
          style={{ 
            scaleX: prefersReducedMotion ? undefined : smoothScrollProgress,
            transform: prefersReducedMotion ? `scaleX(${smoothScrollProgress.get()})` : undefined,
          }}
        />
      )}

      {/* Header */}
      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-50",
          mounted && isScrolled
            ? "py-2 border-b border-white/10 shadow-lg"
            : "py-4"
        )}
        variants={headerVariants}
        animate={isScrolled ? 'scrolled' : 'default'}
        initial={false}
      >
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between relative">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <OptimizedMagneticButton disabled={animationQuality === 'low'}>
                <a href="#" className="relative text-2xl font-bold group">
                  <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Awais Zegham
                  </span>
                  {mounted && animationQuality !== 'low' && (
                    <span className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary via-purple-600 to-pink-600 w-0 group-hover:w-full transition-all duration-300" />
                  )}
                </a>
              </OptimizedMagneticButton>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2">
              <div className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.href;
                  
                  return (
                    <OptimizedMagneticButton 
                      key={item.href} 
                      disabled={animationQuality === 'low'}
                    >
                      <a
                        href={item.href}
                        onClick={(e) => handleNavClick(e, item.href)}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "relative px-4 py-2 rounded-full transition-colors duration-300 flex items-center gap-2 group overflow-hidden",
                          isActive ? "text-primary" : "text-foreground/70 hover:text-foreground"
                        )}
                      >
                        {mounted && isActive && animationQuality !== 'low' && (
                          <motion.div
                            layoutId="navActive"
                            className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/15 via-purple-600/15 to-pink-600/15 backdrop-blur-sm"
                            transition={{ 
                              type: animationQuality === 'medium' ? "tween" : "spring",
                              stiffness: 400, 
                              damping: 35,
                              duration: animationQuality === 'medium' ? 0.2 : undefined,
                            }}
                          />
                        )}
                        <Icon className="w-4 h-4 relative z-10" />
                        <span className="relative z-10 font-medium">{item.label}</span>
                        {animationQuality === 'high' && (
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </a>
                    </OptimizedMagneticButton>
                  );
                })}
              </div>

              {/* Theme Toggle */}
              <OptimizedMagneticButton 
                className="ml-4" 
                disabled={animationQuality === 'low'}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="relative rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10"
                  aria-label="Toggle theme"
                >
                  <div className="relative">
                    <Sun className={cn(
                      "h-5 w-5",
                      animationQuality === 'low' 
                        ? "dark:hidden" 
                        : "rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
                    )} />
                    <Moon className={cn(
                      "h-5 w-5",
                      animationQuality === 'low'
                        ? "hidden dark:block absolute top-0 left-0"
                        : "absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    )} />
                  </div>
                </Button>
              </OptimizedMagneticButton>
            </div>

            {/* Available Badge */}
            <div className="hidden md:flex items-center ml-auto">
              <div className="hidden sm:block">
                <div className="relative">
                  {animationQuality !== 'low' && (
                    <div className="absolute inset-0 bg-green-500 blur-xl opacity-30" />
                  )}
                  <div className="relative px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-500/30 rounded-full">
                    <div className="flex items-center gap-1.5">
                      <div className={cn(
                        "w-2 h-2 bg-green-500 rounded-full",
                        animationQuality === 'high' && "animate-pulse"
                      )} />
                      <span className="text-xs font-medium text-green-400">Available for Freelance</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full bg-white/10 backdrop-blur-md border border-white/20"
                aria-label="Toggle theme"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="rounded-full bg-white/10 backdrop-blur-md border border-white/20"
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
              >
                {mounted && animationQuality !== 'low' ? (
                  <AnimatePresence mode="wait">
                    {isMenuOpen ? (
                      <motion.div
                        key="close"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <X className="h-5 w-5" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="menu"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Menu className="h-5 w-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                ) : (
                  isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mounted && (
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={animationQuality === 'low' ? undefined : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={animationQuality === 'low' ? undefined : { opacity: 0, height: 0 }}
                  transition={{ duration: animationQuality === 'low' ? 0 : 0.3 }}
                  className="md:hidden mt-4 overflow-hidden"
                >
                  <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 p-4">
                    {navItems.map((item, index) => {
                      const Icon = item.icon;
                      const isActive = activeSection === item.href;
                      
                      return (
                        <motion.a
                          key={item.href}
                          href={item.href}
                          onClick={(e) => handleNavClick(e, item.href)}
                          initial={animationQuality === 'low' ? undefined : { x: -50, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: animationQuality === 'low' ? 0 : index * 0.05 }}
                          className={cn(
                            "flex items-center gap-3 py-3 px-4 rounded-xl transition-all",
                            isActive
                              ? "bg-primary/20 text-primary"
                              : "text-foreground/70 hover:bg-white/10 hover:text-foreground"
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                          {isActive && (
                            <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
                          )}
                        </motion.a>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </nav>
      </motion.header>
    </>
  );
}
