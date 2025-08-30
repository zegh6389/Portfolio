"use client";

import { useState, useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { 
  Code2, 
  Database, 
  Palette, 
  Server, 
  Smartphone, 
  Globe,
  Brain,
  Zap,
  GitBranch,
  Cloud,
  Shield,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Skill {
  name: string;
  level: number;
  category: string;
  icon: React.ElementType;
  color: string;
}

const skills: Skill[] = [
  // Frontend
  { name: "React/Next.js", level: 95, category: "Frontend", icon: Code2, color: "from-blue-500 to-cyan-500" },
  { name: "TypeScript", level: 90, category: "Frontend", icon: Code2, color: "from-blue-600 to-blue-400" },
  { name: "Tailwind CSS", level: 92, category: "Frontend", icon: Palette, color: "from-teal-500 to-cyan-500" },
  { name: "Framer Motion", level: 85, category: "Frontend", icon: Zap, color: "from-purple-500 to-pink-500" },
  { name: "Three.js", level: 75, category: "Frontend", icon: Layers, color: "from-indigo-500 to-purple-500" },
  
  // Backend
  { name: "Node.js", level: 88, category: "Backend", icon: Server, color: "from-green-500 to-emerald-500" },
  { name: "Python", level: 85, category: "Backend", icon: Code2, color: "from-yellow-500 to-orange-500" },
  { name: "PostgreSQL", level: 82, category: "Backend", icon: Database, color: "from-blue-500 to-indigo-500" },
  { name: "MongoDB", level: 80, category: "Backend", icon: Database, color: "from-green-600 to-green-400" },
  { name: "GraphQL", level: 78, category: "Backend", icon: Globe, color: "from-pink-500 to-rose-500" },
  
  // Tools & DevOps
  { name: "Git/GitHub", level: 92, category: "Tools", icon: GitBranch, color: "from-gray-600 to-gray-400" },
  { name: "Docker", level: 75, category: "Tools", icon: Cloud, color: "from-blue-600 to-sky-500" },
  { name: "AWS", level: 70, category: "Tools", icon: Cloud, color: "from-orange-500 to-yellow-500" },
  { name: "CI/CD", level: 78, category: "Tools", icon: Zap, color: "from-purple-600 to-purple-400" },
  
  // Mobile & Other
  { name: "React Native", level: 80, category: "Mobile", icon: Smartphone, color: "from-cyan-500 to-blue-500" },
  { name: "Flutter", level: 65, category: "Mobile", icon: Smartphone, color: "from-blue-500 to-light-blue-400" },
  { name: "Security", level: 75, category: "Other", icon: Shield, color: "from-red-500 to-orange-500" },
  { name: "AI/ML", level: 70, category: "Other", icon: Brain, color: "from-purple-600 to-pink-600" },
];

const categories = ["All", "Frontend", "Backend", "Tools", "Mobile", "Other"];

export default function EnhancedSkills() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [mounted, setMounted] = useState(false);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const gridRef = useRef<HTMLDivElement | null>(null);
  useInView(gridRef, { once: true, margin: "-80px" });

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredSkills = selectedCategory === "All" 
    ? skills 
    : skills.filter(skill => skill.category === selectedCategory);

  // Stable particle seeds per skill (avoids Math.random during render each hover)
  const particleSeedsRef = useRef<Record<string, number[]>>({});
  if (Object.keys(particleSeedsRef.current).length === 0) {
    skills.forEach(s => {
      // deterministic pseudo-random seeds based on char codes
      const base = s.name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
      particleSeedsRef.current[s.name] = [0,1,2].map(i => (base * (i + 3) * 97) % 100);
    });
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  if (!mounted) return null;

  return (
    <section id="skills" className="py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5" />
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Skills & Expertise
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A comprehensive toolkit of modern technologies and frameworks
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "px-6 py-2 rounded-full font-medium transition-all duration-300",
                "backdrop-blur-md border",
                selectedCategory === category
                  ? "bg-primary/20 border-primary text-primary shadow-lg shadow-primary/25"
                  : "bg-background/50 border-border hover:bg-background/80 hover:border-primary/50"
              )}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Skills Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            ref={gridRef}
            key={selectedCategory}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredSkills.map((skill) => {
              const Icon = skill.icon;
              return (
                <motion.div
                  key={skill.name}
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                  onHoverStart={() => setHoveredSkill(skill.name)}
                  onHoverEnd={() => setHoveredSkill(null)}
                  className="relative group"
                >
                  {/* Glassmorphism Card */}
                  <div className={cn(
                    "relative p-6 rounded-2xl",
                    // Lighter blur & shadows for performance
                    "bg-background/30 backdrop-blur-md",
                    "border border-border/40",
                    "shadow-md",
                    "transition-all duration-300 will-change-transform",
                    "hover:bg-background/50 hover:border-primary/30",
                    "hover:shadow-lg hover:shadow-primary/10"
                  )}>
                    {/* Gradient Overlay on Hover */}
                    <div className={cn(
                      "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                      "bg-gradient-to-br",
                      skill.color
                    )} style={{ opacity: 0.05 }} />

                    {/* Content */}
                    <div className="relative z-10">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            "bg-gradient-to-br",
                            skill.color,
                            "shadow-lg"
                          )}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {skill.name}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {skill.category}
                            </p>
                          </div>
                        </div>
                        <span className={cn(
                          "text-2xl font-bold",
                          "bg-gradient-to-r",
                          skill.color,
                          "bg-clip-text text-transparent"
                        )}>
                          {skill.level}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="relative">
                        <div className="h-2 bg-muted/30 rounded-full overflow-hidden relative">
                          {/* Animated fill uses scaleX for smoother GPU-accelerated animation */}
                          <motion.div
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: skill.level / 100 }}
                            viewport={{ once: true, amount: 0.5 }}
                            transition={{
                              type: "spring",
                              stiffness: 140,
                              damping: 18,
                              mass: 0.5,
                              delay: 0.15
                            }}
                            style={{
                              transformOrigin: "left",
                              willChange: "transform",
                              width: "100%"
                            }}
                            className={cn(
                              "absolute inset-0 rounded-full",
                              "bg-gradient-to-r",
                              skill.color,
                              "shadow-sm"
                            )}
                          >
                            {/* Shimmer only on hover & if user doesn't prefer reduced motion */}
                            {!prefersReducedMotion && hoveredSkill === skill.name && (
                              <motion.div
                                aria-hidden
                                className="absolute inset-0 rounded-full bg-gradient-to-r from-white/0 via-white/30 to-white/0 mix-blend-overlay"
                                initial={{ translateX: "-100%" }}
                                animate={{ translateX: "100%" }}
                                transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                              />
                            )}
                          </motion.div>
                        </div>

                        {/* Animated Glow Effect */}
                        {hoveredSkill === skill.name && (
                          <motion.div
                            layoutId="skillGlow"
                            className={cn(
                              "pointer-events-none absolute inset-0 rounded-full blur-md",
                              "bg-gradient-to-r",
                              skill.color,
                              "opacity-50"
                            )}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                          />
                        )}
                      </div>

                      {/* Floating Particles */}
                      {hoveredSkill === skill.name && (
                        <div className="absolute inset-0 pointer-events-none">
                          {particleSeedsRef.current[skill.name].map((seed, i) => (
                            <motion.div
                              key={i}
                              className={cn(
                                "absolute w-1 h-1 rounded-full",
                                "bg-gradient-to-r",
                                skill.color
                              )}
                              style={{ left: `${seed}%` }}
                              initial={{ y: 30, opacity: 0 }}
                              animate={{ y: -20, opacity: [0, 1, 0] }}
                              transition={{
                                duration: 2,
                                delay: i * 0.25,
                                repeat: Infinity,
                                ease: "easeOut"
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { label: "Technologies", value: "18+", icon: Code2 },
            { label: "Years Experience", value: "5+", icon: Zap },
            { label: "Projects Completed", value: "50+", icon: Layers },
            { label: "Happy Clients", value: "30+", icon: Brain }
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={cn(
                  "relative p-6 rounded-xl text-center",
                  "bg-background/30 backdrop-blur-md",
                  "border border-border/50",
                  "hover:bg-background/50 hover:border-primary/30",
                  "transition-all duration-300"
                )}
              >
                <Icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
