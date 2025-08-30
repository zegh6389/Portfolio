"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { useReducedMotion as usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { Moon, Sun, Menu, X, Home, User, Briefcase, Mail, Code2 } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Constants
const SCROLL_THRESHOLD = 20;
const MAGNETIC_STRENGTH = 0.3;

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

// Desired order: Home -> Skills -> Resume -> Projects -> Contact
const navItems: NavItem[] = [
  { href: "#home", label: "Home", icon: Home },
  { href: "#skills", label: "Skills", icon: Code2 },
  { href: "#resume", label: "Resume", icon: User },
  { href: "#projects", label: "Projects", icon: Briefcase },
  { href: "#contact", label: "Contact", icon: Mail },
];

// Magnetic button component that only works client-side
function MagneticButton({ children, className }: { children: React.ReactNode; className?: string }) {
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 350, damping: 20 });
  const springY = useSpring(y, { stiffness: 350, damping: 20 });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current || !mounted) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = (e.clientX - centerX) * MAGNETIC_STRENGTH;
    const distanceY = (e.clientY - centerY) * MAGNETIC_STRENGTH;
    x.set(distanceX);
    y.set(distanceY);
  }, [x, y, mounted]);

  const handleMouseLeave = useCallback(() => {
    if (!mounted) return;
    x.set(0);
    y.set(0);
  }, [x, y, mounted]);

  if (!mounted) {
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

export default function EnhancedHeaderFixed() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  // Motion values for scroll progress (avoids re-renders)
  const rawScrollProgress = useMotionValue(0);
  const smoothScrollProgress = useSpring(rawScrollProgress, { stiffness: 160, damping: 30, mass: 0.35 });
  const [activeSection, setActiveSection] = useState("#home");
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const prefersReducedMotion = usePrefersReducedMotion();
  const tickingRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll progress + active section via simple center-based scan (more robust than IO here)
  useEffect(() => {
    if (!mounted) return;

    const sectionIds = navItems.map(n => n.href.slice(1));
    let sections: HTMLElement[] = [];
    const collectSections = () => {
      sections = sectionIds
        .map(id => document.getElementById(id) as HTMLElement | null)
        .filter((el): el is HTMLElement => !!el);
    };
    collectSections();
    // Retry to catch dynamically loaded resume
    [300, 800, 1500].forEach(t => setTimeout(collectSections, t));

    let rafId: number | null = null;
    const HEADER_OFFSET = 120; // adjust if header height changes
    const update = () => {
      const scrollY = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progressRatio = documentHeight > 0 ? Math.min(scrollY / documentHeight, 1) : 0;
      rawScrollProgress.set(progressRatio);
      setIsScrolled(scrollY > SCROLL_THRESHOLD);

      let current: string = '#home';
      const position = scrollY + HEADER_OFFSET; // line used for deciding active
      for (const sec of sections) {
        const top = sec.offsetTop;
        if (top <= position) {
          current = `#${sec.id}`;
        } else {
          break; // sections appear in DOM order; stop once we pass
        }
      }
      if (current !== activeSection) setActiveSection(current);
      // Debug (optional) - comment out in production
      (window as any).__activeSection = current;
    };

    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [mounted, rawScrollProgress]);

  // Handle smooth scrolling
  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      const headerHeight = 80; // adjust if header size changes
      const targetTop = (element as HTMLElement).getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  }, []);

  // Toggle theme with animation
  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <>
      {/* Scroll Progress Bar - Only show when mounted */}
      {mounted && (
        <motion.div
          aria-hidden
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-600 to-pink-600 z-[60] origin-left"
          style={{ scaleX: prefersReducedMotion ? 0 : smoothScrollProgress }}
        />
      )}

      {/* Header */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          mounted && isScrolled
            ? "py-2 bg-background/60 dark:bg-background/40 backdrop-blur-xl border-b border-white/10 shadow-lg"
            : "py-4 bg-transparent"
        )}
      >
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between relative">
            {/* Left: Logo only */}
            <div className="flex items-center gap-3">
              <MagneticButton>
                <a
                  href="#"
                  className="relative text-2xl font-bold group"
                >
                  <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Awais Zegham
                  </span>
                  {mounted && (
                    <span className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary via-purple-600 to-pink-600 w-0 group-hover:w-full transition-all duration-300" />
                  )}
                </a>
              </MagneticButton>
            </div>

            {/* Center: Desktop Navigation + Theme toggle (perfect centered) */}
            <div className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2">
              <div className="flex items-center">
                {/* Glassmorphism nav background */}
                <div className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10">
                  {mounted && (
                    <div className="absolute inset-0 pointer-events-none" />
                  )}
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.href;
                    return (
                      <MagneticButton key={item.href}>
                        <a
                          href={item.href}
                          onClick={(e) => handleNavClick(e, item.href)}
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            "relative px-4 py-2 rounded-full transition-colors duration-300 flex items-center gap-2 group overflow-hidden",
                            isActive ? "text-primary" : "text-foreground/70 hover:text-foreground"
                          )}
                        >
                          {mounted && isActive && (
                            <motion.div
                              layoutId="navActive"
                              className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/15 via-purple-600/15 to-pink-600/15 backdrop-blur-sm"
                              transition={{ type: "spring", stiffness: 400, damping: 35 }}
                            />
                          )}
                          <Icon className="w-4 h-4 relative z-10" />
                          <span className="relative z-10 font-medium">{item.label}</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      </MagneticButton>
                    );
                  })}
                </div>
                {/* Theme Toggle */}
                <MagneticButton className="ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="relative rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10"
                    aria-label="Toggle theme"
                  >
                    <div className="relative">
                      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                  </Button>
                </MagneticButton>
              </div>
            </div>

            {/* Right: Available for Freelance Badge */}
            <div className="hidden md:flex items-center ml-auto">
              <div className="hidden sm:block">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500 blur-xl opacity-30" />
                  <div className="relative px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-500/30 rounded-full">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
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
                {mounted ? (
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
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation with glassmorphism */}
          {mounted && (
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
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
                          initial={{ x: -50, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
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
      </header>
    </>
  );
}
