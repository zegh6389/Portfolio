"use client";

import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, Variants } from "framer-motion";
import { Moon, Sun, Menu, X, Home, User, Briefcase, Mail, Code2 } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAnimationPerformance } from "@/hooks/use-animation-performance";

// Constants
const SCROLL_THRESHOLD = 20;
const MAGNETIC_STRENGTH = 0.3;
const DEBOUNCE_DELAY = 16; // ~60fps

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: "#home", label: "Home", icon: Home },
  { href: "#resume", label: "Resume", icon: User },
  { href: "#skills", label: "Skills", icon: Code2 },
  { href: "#projects", label: "Projects", icon: Briefcase },
  { href: "#contact", label: "Contact", icon: Mail },
];

// Optimized Magnetic button component with GPU acceleration
const MagneticButton = memo(({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string 
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { shouldReduceMotion } = useAnimationPerformance();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 350, damping: 20 });
  const springY = useSpring(y, { stiffness: 350, damping: 20 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current || shouldReduceMotion) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = (e.clientX - centerX) * MAGNETIC_STRENGTH;
    const distanceY = (e.clientY - centerY) * MAGNETIC_STRENGTH;
    x.set(distanceX);
    y.set(distanceY);
  }, [x, y, shouldReduceMotion]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ 
        x: springX, 
        y: springY,
        transform: "translateZ(0)" // Force GPU acceleration
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
});

MagneticButton.displayName = "MagneticButton";

// Optimized NavLink component
const NavLink = memo(({ 
  item, 
  isActive, 
  onClick, 
  index 
}: { 
  item: NavItem; 
  isActive: boolean; 
  onClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
  index: number;
}) => {
  const Icon = item.icon;
  const { shouldReduceMotion } = useAnimationPerformance();
  
  return (
    <MagneticButton>
      <motion.a
        href={item.href}
        onClick={(e) => onClick(e, item.href)}
        className={cn(
          "relative px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2 group",
          isActive ? "text-primary" : "text-foreground/70 hover:text-foreground"
        )}
        initial={shouldReduceMotion ? false : { opacity: 0, y: -20 }}
        animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
        transition={shouldReduceMotion ? undefined : { delay: index * 0.1 }}
        whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
        whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
      >
        {isActive && !shouldReduceMotion && (
          <motion.div
            layoutId="activeNav"
            className="absolute inset-0 bg-primary/10 rounded-full"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            style={{ transform: "translateZ(0)" }}
          />
        )}
        
        <Icon className="w-4 h-4 relative z-10" />
        <span className="relative z-10 font-medium">{item.label}</span>
        
        {!shouldReduceMotion && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            initial={false}
            style={{ transform: "translateZ(0)" }}
          />
        )}
      </motion.a>
    </MagneticButton>
  );
});

NavLink.displayName = "NavLink";

// Optimized scroll progress bar
const ScrollProgressBar = memo(() => {
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { shouldReduceMotion } = useAnimationPerformance();
  const rafRef = useRef<number>();

  useEffect(() => {
    setMounted(true);
    const updateProgress = () => {
      const scrollY = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const newProgress = documentHeight > 0 ? (scrollY / documentHeight) : 0;
      setProgress(newProgress);
    };

    const handleScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(updateProgress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateProgress();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Return consistent initial render
  if (!mounted) {
    return (
      <div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-600 to-pink-600 z-[60]"
        style={{ 
          transform: "scaleX(0) translateZ(0)"
        }}
      />
    );
  }

  if (shouldReduceMotion) {
    return (
      <div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-primary via-purple-600 to-pink-600 z-[60]"
        style={{ 
          width: `${progress * 100}%`,
          transform: "translateZ(0)"
        }}
      />
    );
  }

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-600 to-pink-600 z-[60] origin-left"
      style={{ 
        scaleX: progress,
        transform: "translateZ(0)"
      }}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: progress }}
      transition={{ ease: "linear" }}
    />
  );
});

ScrollProgressBar.displayName = "ScrollProgressBar";

export default function OptimizedHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("#home");
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { shouldReduceMotion } = useAnimationPerformance();
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const rafRef = useRef<number>();

  useEffect(() => {
    setMounted(true);
    
    // Set initial scroll state on mount
    const scrollY = window.scrollY;
    setIsScrolled(scrollY > SCROLL_THRESHOLD);
  }, []);

  // Optimized scroll handler with debouncing and RAF
  useEffect(() => {
    const updateScrollState = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > SCROLL_THRESHOLD);

      // Update active section
      const sections = navItems.map(item => item.href.substring(1));
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(`#${section}`);
            break;
          }
        }
      }
    };

    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
        rafRef.current = requestAnimationFrame(updateScrollState);
      }, DEBOUNCE_DELAY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Optimized smooth scrolling
  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      const behavior = shouldReduceMotion ? "auto" : "smooth";
      element.scrollIntoView({ behavior });
      setIsMenuOpen(false);
      setActiveSection(href);
    }
  }, [shouldReduceMotion]);

  const toggleTheme = useCallback(() => {
    if (mounted) {
      setTheme(theme === "dark" ? "light" : "dark");
    }
  }, [theme, setTheme, mounted]);

  // Use suppressHydrationWarning for dynamic content
  return (
    <>
      <div suppressHydrationWarning>
        <ScrollProgressBar />
      </div>

      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          "will-change-transform", // Optimize for animations
          isScrolled
            ? "py-2 bg-background/60 dark:bg-background/40 backdrop-blur-xl border-b border-white/10 shadow-lg"
            : "py-4 bg-transparent"
        )}
        style={{ 
          transform: "translateZ(0)", // Always apply for consistency
        }}
      >
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <MagneticButton>
              <motion.a
                href="#"
                className="relative text-2xl font-bold"
                whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
              >
                <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Awais Zegham
                </span>
                {!shouldReduceMotion && (
                  <motion.span
                    className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary via-purple-600 to-pink-600"
                    initial={{ width: 0 }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                    style={{ transform: "translateZ(0)" }}
                  />
                )}
              </motion.a>
            </MagneticButton>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center flex-1 justify-center">
              <div className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10">
                {navItems.map((item, index) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    isActive={activeSection === item.href}
                    onClick={handleNavClick}
                    index={index}
                  />
                ))}
              </div>

              {/* Theme Toggle */}
              <MagneticButton className="ml-4">
                <div suppressHydrationWarning>
                  {mounted && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleTheme}
                      className="relative rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10"
                      aria-label="Toggle theme"
                    >
                      <motion.div
                        initial={false}
                        animate={shouldReduceMotion ? {} : { 
                          rotate: theme === "dark" ? 180 : 0 
                        }}
                        transition={shouldReduceMotion ? undefined : { 
                          duration: 0.5, 
                          ease: "easeInOut" 
                        }}
                      >
                        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </motion.div>
                    </Button>
                  )}
                </div>
              </MagneticButton>
            </div>

            {/* Available for Freelance Badge */}
            <div className="hidden md:block">
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.8 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
                transition={shouldReduceMotion ? undefined : { 
                  delay: 0.5, 
                  type: "spring", 
                  stiffness: 200 
                }}
              >
                <div className="relative">
                  {!shouldReduceMotion && (
                    <div className="absolute inset-0 bg-green-500 blur-xl opacity-30 animate-pulse" />
                  )}
                  <div className="relative px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-500/30 rounded-full">
                    <div className="flex items-center gap-1.5">
                      <div className={cn(
                        "w-2 h-2 bg-green-500 rounded-full",
                        !shouldReduceMotion && "animate-pulse"
                      )} />
                      <span className="text-xs font-medium text-green-400">Available for Freelance</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              <div suppressHydrationWarning>
                {mounted && (
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
                )}
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="rounded-full bg-white/10 backdrop-blur-md border border-white/20"
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
              >
                <AnimatePresence mode="wait">
                  {isMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={shouldReduceMotion ? {} : { rotate: -90, opacity: 0 }}
                      animate={shouldReduceMotion ? {} : { rotate: 0, opacity: 1 }}
                      exit={shouldReduceMotion ? {} : { rotate: 90, opacity: 0 }}
                      transition={shouldReduceMotion ? undefined : { duration: 0.2 }}
                    >
                      <X className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={shouldReduceMotion ? {} : { rotate: 90, opacity: 0 }}
                      animate={shouldReduceMotion ? {} : { rotate: 0, opacity: 1 }}
                      exit={shouldReduceMotion ? {} : { rotate: -90, opacity: 0 }}
                      transition={shouldReduceMotion ? undefined : { duration: 0.2 }}
                    >
                      <Menu className="h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0, height: 0 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, height: "auto" }}
                exit={shouldReduceMotion ? {} : { opacity: 0, height: 0 }}
                transition={shouldReduceMotion ? undefined : { duration: 0.3 }}
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
                        initial={shouldReduceMotion ? {} : { x: -50, opacity: 0 }}
                        animate={shouldReduceMotion ? {} : { x: 0, opacity: 1 }}
                        transition={shouldReduceMotion ? undefined : { delay: index * 0.1 }}
                        className={cn(
                          "flex items-center gap-3 py-3 px-4 rounded-xl transition-all",
                          isActive
                            ? "bg-primary/20 text-primary"
                            : "text-foreground/70 hover:bg-white/10 hover:text-foreground"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                        {isActive && !shouldReduceMotion && (
                          <motion.div
                            layoutId="activeMobileNav"
                            className="ml-auto w-2 h-2 bg-primary rounded-full"
                          />
                        )}
                      </motion.a>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </header>
    </>
  );
}
