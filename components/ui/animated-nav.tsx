"use client";

import * as React from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  User, 
  Briefcase, 
  Mail, 
  Menu, 
  X, 
  ChevronRight,
  Sparkles,
  Code,
  Palette,
  Rocket
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

interface AnimatedNavProps {
  items?: NavItem[];
  className?: string;
}

export function AnimatedNav({ items = defaultItems, className }: AnimatedNavProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState(0);
  const { scrollY } = useScroll();
  const navOpacity = useTransform(scrollY, [0, 100], [1, 0.95]);
  const navScale = useTransform(scrollY, [0, 100], [1, 0.98]);

  return (
    <motion.nav
      style={{ opacity: navOpacity, scale: navScale }}
      className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 z-50",
        "backdrop-blur-xl bg-background/30 border border-white/10",
        "rounded-full px-2 py-2 shadow-2xl",
        className
      )}
    >
      <div className="flex items-center gap-1">
        {items.map((item, index) => (
          <NavItem
            key={item.href}
            item={item}
            isActive={activeItem === index}
            onClick={() => setActiveItem(index)}
          />
        ))}
      </div>
    </motion.nav>
  );
}

function NavItem({ 
  item, 
  isActive, 
  onClick 
}: { 
  item: NavItem; 
  isActive: boolean; 
  onClick: () => void;
}) {
  return (
    <motion.a
      href={item.href}
      onClick={onClick}
      className="relative px-4 py-2 rounded-full text-sm font-medium transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {isActive && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute inset-0 bg-primary/20 rounded-full border border-primary/30"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      <span className={cn(
        "relative z-10 flex items-center gap-2",
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
      )}>
        {item.icon}
        {item.label}
      </span>
    </motion.a>
  );
}

const defaultItems: NavItem[] = [
  { href: "#home", label: "Home", icon: <Home className="w-4 h-4" /> },
  { href: "#about", label: "About", icon: <User className="w-4 h-4" /> },
  { href: "#projects", label: "Projects", icon: <Briefcase className="w-4 h-4" /> },
  { href: "#contact", label: "Contact", icon: <Mail className="w-4 h-4" /> },
];

export function FloatingNav({ className }: { className?: string }) {
  const [isVisible, setIsVisible] = React.useState(true);
  const [lastScrollY, setLastScrollY] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 100);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "fixed top-4 left-1/2 -translate-x-1/2 z-50",
            className
          )}
        >
          <AnimatedNav />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function MobileNav({ items = defaultItems }: AnimatedNavProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 md:hidden backdrop-blur-xl bg-background/30 border border-white/10 rounded-full"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
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

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 h-full w-64 bg-background/95 backdrop-blur-xl border-l border-white/10 z-40 md:hidden"
            >
              <nav className="flex flex-col gap-2 p-6 mt-16">
                {items.map((item, index) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </motion.a>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function MagneticNav({ items = defaultItems }: AnimatedNavProps) {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2,
    });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <motion.nav
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        x: mousePosition.x * 0.1,
        y: mousePosition.y * 0.1,
      }}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 backdrop-blur-xl bg-background/30 border border-white/10 rounded-full px-6 py-3"
    >
      <div className="flex items-center gap-6">
        {items.map((item) => (
          <motion.a
            key={item.href}
            href={item.href}
            whileHover={{ scale: 1.2, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {item.icon || item.label}
          </motion.a>
        ))}
      </div>
    </motion.nav>
  );
}

export function CreativeNav() {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const navItems = [
    { icon: <Sparkles />, label: "Features", color: "from-purple-500 to-pink-500" },
    { icon: <Code />, label: "Development", color: "from-blue-500 to-cyan-500" },
    { icon: <Palette />, label: "Design", color: "from-green-500 to-emerald-500" },
    { icon: <Rocket />, label: "Launch", color: "from-orange-500 to-red-500" },
  ];

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 backdrop-blur-xl bg-background/30 border border-white/10 rounded-2xl p-2">
        {navItems.map((item, index) => (
          <motion.button
            key={index}
            onHoverStart={() => setHoveredIndex(index)}
            onHoverEnd={() => setHoveredIndex(null)}
            className="relative px-4 py-3 rounded-xl transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence>
              {hoveredIndex === index && (
                <motion.div
                  layoutId="creative-nav-bg"
                  className={cn(
                    "absolute inset-0 rounded-xl bg-gradient-to-r",
                    item.color
                  )}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.2 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </AnimatePresence>
            <div className="relative z-10 flex items-center gap-2">
              <motion.div
                animate={{
                  rotate: hoveredIndex === index ? 360 : 0,
                }}
                transition={{ duration: 0.3 }}
              >
                {React.cloneElement(item.icon as React.ReactElement, {
                  className: "w-5 h-5",
                })}
              </motion.div>
              <AnimatePresence>
                {hoveredIndex === index && (
                  <motion.span
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="overflow-hidden whitespace-nowrap font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.button>
        ))}
      </div>
    </nav>
  );
}
