"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail, MessageSquare } from "lucide-react";
import { ChatWidget } from "@/components/ChatWidget";
import { cn } from "@/lib/utils";

interface SocialLink {
  name: string;
  icon: React.ElementType;
  href?: string;
  color: string;
  bgGradient: string;
  action?: () => void;
}

export default function FloatingSocial() {
  const [mounted, setMounted] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const socialLinks: SocialLink[] = [
    {
      name: "GitHub",
      icon: Github,
      href: "https://github.com/zegh6389",
      color: "text-foreground/80",
      bgGradient: "from-gray-500/40 via-gray-600/40 to-gray-700/40",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: "https://www.linkedin.com/in/awais-zegham-38201b272/",
      color: "text-foreground/80",
      bgGradient: "from-sky-500/40 to-blue-600/40",
    },
    {
      name: "Email",
      icon: Mail,
      href: "mailto:Awaiszegham374@gmail.com",
      color: "text-foreground/80",
      bgGradient: "from-pink-500/40 to-rose-600/40",
    },
    {
      name: "Chat",
      icon: MessageSquare,
      color: "text-foreground/80",
      bgGradient: "from-emerald-500/40 to-green-600/40",
      action: () => {
        setChatOpen(true);
        setChatMinimized(false);
      },
    },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <motion.div
      className="fixed inset-x-0 bottom-8 z-50 flex justify-center"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 260,
        damping: 20,
        delay: 0.5 
      }}
    >
      {/* Capsule Container */}
      <div className="relative pointer-events-auto">
        {/* Glow Effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/25 via-purple-600/20 to-pink-600/25 blur-2xl opacity-60"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Main Capsule */}
        <motion.div 
          className="relative flex items-center gap-1 px-2 py-2 rounded-full shadow-2xl border border-white/20 dark:border-white/10 bg-white/10 dark:bg-white/5 backdrop-blur-md"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {socialLinks.map((link, index) => {
            const Icon = link.icon;
            const isHovered = hoveredIndex === index;
            
            return (
              <motion.div
                key={link.name}
                className="relative"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Tooltip */}
                <motion.div
                  className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md whitespace-nowrap pointer-events-none"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ 
                    opacity: isHovered ? 1 : 0,
                    y: isHovered ? 0 : 5
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {link.name}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45" />
                </motion.div>

                {/* Icon Button */}
                <motion.button
                  type="button"
                  onClick={() => {
                    if (link.action) link.action();
                    if (link.href) window.open(link.href, '_blank', 'noopener,noreferrer');
                  }}
                  className={cn(
                    "relative flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300 group overflow-hidden",
                    "hover:bg-white/10 dark:hover:bg-white/10",
                    isHovered && "bg-gradient-to-br"
                  )}
                  style={isHovered ? { backgroundImage: `linear-gradient(145deg, var(--tw-gradient-stops))` } : undefined}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Background Gradient on Hover */}
                  {isHovered && (
                    <motion.div
                      className={cn("absolute inset-0 bg-gradient-to-br rounded-full mix-blend-overlay", link.bgGradient)}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.25 }}
                    />
                  )}

                  {/* Icon with Rotation Animation */}
                  <motion.div
          className="relative z-10"
                    animate={{
                      rotate: isHovered ? 360 : 0,
                      scale: isHovered ? 1.1 : 1,
                    }}
                    transition={{
                      rotate: {
                        duration: 0.6,
                        ease: "easeInOut",
                      },
                      scale: {
                        duration: 0.2,
                      },
                    }}
                  >
                    <Icon 
                      className={cn(
            "w-5 h-5 transition-all duration-300 drop-shadow-sm",
            isHovered ? "text-white" : link.color
                      )} 
                    />
                  </motion.div>

                  {/* Ripple Effect on Hover */}
                  {isHovered && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      initial={{ scale: 0, opacity: 0.5 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      style={{
                        background: "radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)",
                      }}
                    />
                  )}
                </motion.button>

                {/* Pulse Animation for Active Items */}
                {(link.name === "Chat") && (
                  <motion.div
                    className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.7, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Floating Particles Around Capsule */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            style={{
              left: `${20 + i * 30}%`,
              top: "50%",
            }}
            animate={{
              y: [-20, -40, -20],
              x: [0, (i - 1) * 10, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <ChatWidget 
        open={chatOpen} 
        minimized={chatMinimized}
        onClose={() => { setChatOpen(false); setChatMinimized(false); }}
        onMinimize={() => setChatMinimized(true)}
        onRestore={() => setChatMinimized(false)}
      />
    </motion.div>
  );
}
