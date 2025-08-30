"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring, motion } from "framer-motion";
import { Code2, Users, Trophy, Coffee } from "lucide-react";
import { cn } from "@/lib/utils";

interface CounterProps {
  format?: (value: number) => string;
  targetValue: number;
  direction?: "up" | "down";
  delay?: number;
  className?: string;
}

export const Formatter = {
  number: (value: number) =>
    Intl.NumberFormat("en-US").format(+value.toFixed(0)),
  currency: (value: number) =>
    Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
      +value.toFixed(0)
    ),
};

function Counter({
  format = Formatter.number,
  targetValue,
  direction = "up",
  delay = 0,
  className,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isGoingUp = direction === "up";
  const motionValue = useMotionValue(isGoingUp ? 0 : targetValue);

  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 80,
  });
  const isInView = useInView(ref, { margin: "0px", once: true });

  useEffect(() => {
    if (!isInView) {
      return;
    }

    const timer = setTimeout(() => {
      motionValue.set(isGoingUp ? targetValue : 0);
    }, delay);

    return () => clearTimeout(timer);
  }, [isInView, delay, isGoingUp, targetValue, motionValue]);

  useEffect(() => {
    springValue.on("change", (value) => {
      if (ref.current) {
        ref.current.textContent = format ? format(value) : String(value);
      }
    });
  }, [springValue, format]);

  return (
    <span
      ref={ref}
      className={cn("text-4xl font-bold", className)}
    />
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  suffix?: string;
  delay?: number;
  gradient: string;
}

function StatCard({ icon, value, label, suffix = "", delay = 0, gradient }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="relative group"
    >
      {/* Glassmorphic card with gradient border */}
      <div className="absolute inset-0 bg-gradient-to-br opacity-75 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"
           style={{ background: gradient }} />
      
      <div className="relative backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-2xl p-6 shadow-2xl">
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"
             style={{ background: gradient }} />
        
        {/* Icon with gradient background */}
        <div className="relative mb-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg"
               style={{ background: gradient }}>
            {icon}
          </div>
        </div>
        
        {/* Counter */}
        <div className="relative">
          <div className="flex items-baseline gap-1">
            <Counter
              targetValue={value}
              delay={delay * 100}
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent"
            />
            {suffix && (
              <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                {suffix}
              </span>
            )}
          </div>
          <p className="text-sm md:text-base text-white/70 dark:text-white/60 mt-2 font-medium">
            {label}
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-2xl" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/5 to-transparent rounded-2xl" />
      </div>
    </motion.div>
  );
}

export default function StatsSection() {
  const stats = [
    {
      icon: <Trophy className="w-7 h-7" />,
      value: 50,
      suffix: "+",
      label: "Projects Completed",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      icon: <Code2 className="w-7 h-7" />,
      value: 5,
      suffix: "+",
      label: "Years Experience",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      icon: <Users className="w-7 h-7" />,
      value: 30,
      suffix: "+",
      label: "Happy Clients",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
      icon: <Coffee className="w-7 h-7" />,
      value: 1000,
      suffix: "+",
      label: "Cups of Coffee",
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    },
  ];

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5" />
      
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse delay-500" />
      
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Achievements & Stats
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A glimpse into my journey and the milestones I&apos;ve achieved
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              {...stat}
              delay={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
