"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
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

const navItems: NavItem[] = [
  { href: "#home", label: "Home", icon: Home },
  { href: "#about", label: "About", icon: User },
  { href: "#projects", label: "Projects", icon: Briefcase },
  { href: "#skills", label: "Skills", icon: Code2 },
  { href: "#contact", label: "Contact", icon: Mail },
];

// Magnetic button component
function MagneticButton({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 350, damping: 20 });
  const springY = useSpring(y, { stiffness: 350, damping: 20 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = (e.clientX - centerX) * MAGNETIC_STRENGTH;
    const distanceY = (e.clientY - centerY) * MAGNETIC_STRENGTH;
    x.set(distanceX);
    y.set(distanceY);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

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

export default function HeaderFixed() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("#home");
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle scroll events - only run on client
  useEffect(() => {
    if (!mounted) return;
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min((scrollY / Math.max(documentHeight, 1)) * 100, 100);
      
      setIsScrolled(scrollY > SCROLL_THRESHOLD);
      setScrollProgress(progress);

      // Update active section based on scroll position
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

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Call once to set initial state
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mounted]);

  // Handle smooth scrolling
  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
      setActiveSection(href);
    }
  }, []);

  // Toggle theme with animation
  const toggleTheme = useCallback(() => {
    if (!mounted) return;
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme, mounted]);

  // Don't render dynamic content until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 py-4 bg-transparent">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a href="#" className="relative text-2xl font-bold">
                <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Awais Zegham
                </span>
              </a>
            </div>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <>
      {/* Scroll Progress Bar */}
      <div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-600 to-pink-600 z-[60] origin-left transition-transform duration-100"
        style={{ 
          transform: `scaleX(${scrollProgress / 100})`,
          willChange: 'transform'
        }}
      />

      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled
            ? "py-2 bg-background/60 dark:bg-background/40 backdrop-blur-xl border-b border-white/10 shadow-lg"
            : "py-4 bg-transparent"
        )}
      >
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo with gradient animation and Available badge */}
            <div className="flex items-center gap-3">
              <MagneticButton>
                <motion.a
                  href="#"
                  className="relative text-2xl font-bold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Awais Zegham
                  </span>
                  <motion.span
                    className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary via-purple-600 to-pink-600"
                    initial={{ width: 0 }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.a>
              </MagneticButton>
              
              {/* Available for Freelance Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                className="hidden sm:block"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500 blur-xl opacity-30 animate-pulse" />
                  <div className="relative px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-500/30 rounded-full">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs font-medium text-green-400">Available for Freelance</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center">
              {/* Glassmorphism nav background */}
              <div className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.href;
                  
                  return (
                    <MagneticButton key={item.href}>
                      <motion.a
                        href={item.href}
                        onClick={(e) => handleNavClick(e, item.href)}
                        className={cn(
                          "relative px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2 group",
                          isActive
                            ? "text-primary"
                            : "text-foreground/70 hover:text-foreground"
                        )}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {/* Active indicator */}
                        {isActive && (
                          <motion.div
                            layoutId="activeNav"
                            className="absolute inset-0 bg-primary/10 rounded-full"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                        
                        <Icon className="w-4 h-4 relative z-10" />
                        <span className="relative z-10 font-medium">{item.label}</span>
                        
                        {/* Hover effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          initial={false}
                        />
                      </motion.a>
                    </MagneticButton>
                  );
                })}
              </div>

              {/* Theme Toggle with animation */}
              <MagneticButton className="ml-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="relative rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10"
                  aria-label="Toggle theme"
                >
                  <motion.div
                    initial={false}
                    animate={{ rotate: theme === "dark" ? 180 : 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </motion.div>
                </Button>
              </MagneticButton>
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
              </Button>
            </div>
          </div>

          {/* Mobile Navigation with glassmorphism */}
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
      </motion.header>
    </>
  );
}
