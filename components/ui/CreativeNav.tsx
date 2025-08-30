"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Mail, Linkedin, MessageCircle } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  color?: string;
}

const navItems: NavItem[] = [
  { 
    href: "https://github.com", 
    label: "GitHub", 
    icon: <Github className="w-5 h-5" />,
    color: "from-gray-600 to-gray-800"
  },
  { 
    href: "mailto:example@example.com", 
    label: "Email", 
    icon: <Mail className="w-5 h-5" />,
    color: "from-blue-500 to-blue-700"
  },
  { 
    href: "https://www.linkedin.com", 
    label: "LinkedIn", 
    icon: <Linkedin className="w-5 h-5" />,
    color: "from-blue-600 to-blue-800"
  },
  { 
    href: "#chat", 
    label: "Chat", 
    icon: <MessageCircle className="w-5 h-5" />,
    color: "from-green-500 to-green-700"
  },
];

export function CreativeNav() {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 backdrop-blur-xl bg-background/30 border border-white/10 rounded-2xl p-2">
        {navItems.map((item, index) => (
          <motion.a
            key={index}
            href={item.href}
            onHoverStart={() => setHoveredIndex(index)}
            onHoverEnd={() => setHoveredIndex(null)}
            className="relative px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence>
              {hoveredIndex === index && (
                <motion.div
                  layoutId="creative-nav-bg"
                  className={`absolute inset-0 rounded-xl bg-gradient-to-r ${item.color || 'from-primary/20 to-primary/10'}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.15 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
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
                {item.icon}
              </motion.div>
              
              <AnimatePresence>
                {hoveredIndex === index && (
                  <motion.span
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden whitespace-nowrap font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.a>
        ))}
      </div>
    </nav>
  );
}
