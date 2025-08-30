"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ExternalLink, ArrowUpRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface Project {
  id: number;
  title: string;
  description: string;
  image?: string;
  technologies: string[];
  category: string;
  github?: string;
  demo?: string;
  featured?: boolean;
}

interface EnhancedProjectCardProps {
  project: Project;
  index: number;
  viewMode?: "grid" | "list";
  enableViewportAnimation?: boolean; // when true, animation triggers when card enters viewport
}

export default function EnhancedProjectCard({
  project,
  index,
  viewMode = "grid",
  enableViewportAnimation = false,
}: EnhancedProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  
  const gradients = [
    "from-purple-600 to-pink-600",
    "from-blue-600 to-cyan-600",
    "from-green-600 to-teal-600",
    "from-orange-600 to-red-600",
    "from-indigo-600 to-purple-600",
    "from-pink-600 to-rose-600",
  ];
  
  const gradient = gradients[index % gradients.length];

  const viewportCardProps = enableViewportAnimation && !prefersReducedMotion ? {
    initial: "hidden",
    whileInView: "visible",
    viewport: { once: true, amount: 0.2 },
    variants: {
      hidden: { opacity: 0, y: 48, scale: 0.95 },
      visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 260, damping: 28, duration: 0.65 } },
    },
  } : {};

  if (viewMode === "list") {
    return (
      <motion.div
        {...viewportCardProps}
        {...(!enableViewportAnimation ? {
          initial: prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -32 },
          animate: { opacity: 1, x: 0 },
          transition: { type: "spring", stiffness: 260, damping: 28, delay: prefersReducedMotion ? 0 : index * 0.05 }
        } : {})}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
    className="relative z-10 group will-change-transform"
      >
        {/* Gradient border effect */}
        <div className={cn(
          "absolute -inset-0.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm",
          `bg-gradient-to-r ${gradient}`
        )} />
        
        {/* Main card with glassmorphism */}
        <div className="relative backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-xl overflow-hidden shadow-2xl">
          <div className="flex flex-col md:flex-row">
            {/* Image section */}
            <div className="relative w-full md:w-64 h-48 md:h-auto overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
              
              <div
                className={cn(
                  "absolute inset-0 z-10 opacity-0 group-hover:opacity-30 transition-opacity duration-300",
                  `bg-gradient-to-br ${gradient}`
                )}
              />
              
              <div
                className={cn(
                  "relative w-full h-full transition-transform duration-500",
                  isHovered && !prefersReducedMotion ? "scale-[1.08]" : "scale-100"
                )}
              >
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                  <span className="text-white/50 text-sm">Project Preview</span>
                </div>
              </div>
            </div>
            
            {/* Content section */}
            <div className="flex-1 p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  {project.title}
                </h3>
                {project.featured && (
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 px-3 py-1 ml-2">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
              
              <p className="text-sm md:text-base text-white/70 dark:text-white/60 mb-4">
                {project.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {project.technologies.slice(0, 5).map((tech) => (
                  <Badge
                    key={tech}
                    variant="secondary"
                    className="bg-white/10 backdrop-blur-md border border-white/20 text-white/80 hover:bg-white/20 transition-colors will-change-transform"
                  >
                    {tech}
                  </Badge>
                ))}
                {project.technologies.length > 5 && (
                  <Badge 
                    variant="secondary" 
                    className="bg-white/10 backdrop-blur-md border border-white/20 text-white/80"
                  >
                    +{project.technologies.length - 5}
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-4">
                {project.demo && (
                  <Button
                    size="sm"
                    className="relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors group text-white"
                    asChild
                  >
                    <Link href={project.demo} target="_blank" rel="noopener noreferrer" className="flex items-center">
                      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.25),transparent_60%)]" />
                      <span className="absolute -inset-1 rounded-md bg-gradient-to-r from-primary/50 via-purple-600/50 to-pink-600/50 opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-500" />
                      <ExternalLink className="w-4 h-4 mr-2 relative z-10 drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]" />
                      <span className="relative z-10 font-medium drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]">Live Demo</span>
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view (default)
  return (
    <motion.div
      {...viewportCardProps}
      {...(!enableViewportAnimation ? {
        initial: prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 },
        animate: { opacity: 1, y: 0 },
        transition: { type: "spring", stiffness: 260, damping: 26, delay: prefersReducedMotion ? 0 : index * 0.05 }
      } : {})}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
  className="relative z-10 group h-full will-change-transform"
    >
      {/* Gradient border effect */}
      <div className={cn(
        "absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm",
        `bg-gradient-to-r ${gradient}`
      )} />
      
      {/* Main card with glassmorphism */}
      <div className="relative h-full backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {/* Featured badge */}
        {project.featured && (
          <div className="absolute top-4 right-4 z-20">
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 px-3 py-1">
              <Sparkles className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          </div>
        )}
        
        {/* Image container with overlay */}
        <div className="relative h-48 md:h-56 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
          
          {/* Animated gradient overlay on hover */}
          <div
            className={cn(
              "absolute inset-0 z-10 opacity-0 group-hover:opacity-30 transition-opacity duration-300",
              `bg-gradient-to-br ${gradient}`
            )}
          />
          
          {/* Project image */}
          <div
            className={cn(
              "relative w-full h-full transition-transform duration-500",
              isHovered && !prefersReducedMotion ? "scale-[1.08]" : "scale-100"
            )}
          >
            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
              <span className="text-white/50 text-sm">Project Preview</span>
            </div>
          </div>
          
          {/* Hover overlay with links */}
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-black/70 backdrop-blur-sm z-20 flex items-center justify-center gap-4 pointer-events-none"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.25 }}
            style={{ pointerEvents: isHovered ? "auto" : "none" }}
          >
            {project.demo && (
              <Button
                size="sm"
                className="relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors group text-white"
                asChild
              >
                <Link href={project.demo} target="_blank" rel="noopener noreferrer" className="flex items-center">
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.25),transparent_60%)]" />
                  <span className="absolute -inset-1 rounded-md bg-gradient-to-r from-primary/50 via-purple-600/50 to-pink-600/50 opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-500" />
                  <ExternalLink className="w-4 h-4 mr-2 relative z-10 drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]" />
                  <span className="relative z-10 font-medium drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]">Live Demo</span>
                </Link>
              </Button>
            )}
          </motion.div>
        </div>
        
        {/* Content section */}
        <div className="p-6">
          {/* Title with gradient */}
          <h3 className="text-xl md:text-2xl font-bold mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            {project.title}
          </h3>
          
          {/* Description */}
          <p className="text-sm md:text-base text-white/70 dark:text-white/60 mb-4 line-clamp-2">
            {project.description}
          </p>
          
          {/* Tech stack badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {project.technologies.slice(0, 4).map((tech) => (
              <Badge
                key={tech}
                variant="secondary"
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white/80 hover:bg-white/20 transition-colors will-change-transform"
              >
                {tech}
              </Badge>
            ))}
            {project.technologies.length > 4 && (
              <Badge 
                variant="secondary" 
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white/80"
              >
                +{project.technologies.length - 4}
              </Badge>
            )}
          </div>
          
          {/* View project link */}
          <motion.div
            className="flex items-center text-sm font-medium text-white/80 hover:text-white transition-colors cursor-pointer"
            whileHover={{ x: 5 }}
          >
            View Project
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/5 to-transparent rounded-2xl" />
      </div>
    </motion.div>
  );
}
