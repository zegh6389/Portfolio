"use client";

import { useState, useEffect } from "react";
import { motion, useAnimation, Variants } from "framer-motion";
import { Github, Linkedin, Mail, ChevronDown, Sparkles, Code, Palette, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TypewriterText, ScrambleText } from "@/components/ui/animated-text";

// Animated text component
function AnimatedText({ text, className }: { text: string; className?: string }) {
  const words = text.split(" ");
  
  const container: Variants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.04 * i },
    }),
  };

  const child: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
    },
  };

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, index) => (
        <motion.span
          variants={child}
          key={index}
          className="inline-block mr-2"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}

// Floating animation component
function FloatingIcon({ icon: Icon, delay = 0, className }: { icon: React.ElementType; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ y: 0 }}
      animate={{ 
        y: [-10, 10, -10],
        rotate: [-5, 5, -5],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    >
      <Icon className="w-8 h-8 text-primary/20" />
    </motion.div>
  );
}

// Optimized Particle effect component with reduced particle count
function ParticleField() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reduced particles from 50 to 15 for better performance
  const generateParticles = () => {
    return Array.from({ length: 15 }, (_, i) => {
      // Create deterministic values based on index
      const row = Math.floor(i / 5);
      const col = i % 5;
      const x = (col * 20) + (row % 2 ? 10 : 0); // Spread particles more
      const y = (row * 33) + ((col % 2) * 15); // Better distribution
      const size = ((i % 3) + 2) * 2; // Size cycles through 4, 6, 8
      const duration = 15 + (i % 3) * 5; // Duration cycles through 15, 20, 25 (slower)
      const delay = (i % 5) * 0.5; // Stagger delays
      
      return {
        id: i,
        x: x % 100,
        y: y % 100,
        size,
        duration,
        delay,
      };
    });
  };

  const particles = generateParticles();

  // Don't render particles until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-r from-primary/10 to-purple-600/10"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            willChange: 'transform, opacity',
          }}
          animate={{
            y: [-20, -100],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

export default function EnhancedHero() {
  const [currentRole, setCurrentRole] = useState(0);
  const controls = useAnimation();
  
  const roles = [
    "Full Stack Developer",
    "UI/UX Designer",
    "Problem Solver",
    "Creative Thinker",
  ];

  const techStack = [
    "React", "Next.js", "TypeScript", "Node.js", 
    "Tailwind CSS", "PostgreSQL", "Docker", "AWS"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRole((prev) => (prev + 1) % roles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [roles.length]);

  useEffect(() => {
    controls.start({
      opacity: [0, 1],
      y: [20, 0],
      transition: { duration: 0.5 },
    });
  }, [currentRole, controls]);

  return (
  <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5" />
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-purple-500/10"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Particle effects */}
      <ParticleField />

      {/* Floating icons */}
      <FloatingIcon icon={Code} delay={0} className="absolute top-20 left-10 lg:left-20" />
      <FloatingIcon icon={Palette} delay={2} className="absolute top-40 right-10 lg:right-20" />
      <FloatingIcon icon={Rocket} delay={4} className="absolute bottom-40 left-10 lg:left-40" />
      <FloatingIcon icon={Sparkles} delay={1} className="absolute bottom-20 right-10 lg:right-40" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-8">
        <div className="text-center max-w-5xl mx-auto">
          {/* Main heading with gradient */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 mt-8"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              <TypewriterText 
                text="Hi, I'm Awais Zegham"
                className="text-foreground"
                duration={3}
                delay={0.15}
                showCaretAfterFinish
                caretClassName="bg-gradient-to-b from-primary to-purple-600 w-[2px]"
                respectReducedMotion={false}
              />
            </h1>
            <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold">
              <span className="text-foreground/70">I'm a</span>
              <motion.span
                key={currentRole}
                animate={controls}
                className="block bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent mt-2"
              >
                {roles[currentRole]}
              </motion.span>
            </div>
          </motion.div>

          {/* Animated description with ScrambleText */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto"
          >
            <span>Building innovative web solutions with </span>
            <ScrambleText
              text="modern technologies and creative design"
              className="inline-block"
              duration={3}
            />
          </motion.div>

          {/* Tech stack badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-2 mb-12"
          >
            {techStack.map((tech, index) => (
              <motion.div
                key={tech}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                whileHover={{ scale: 1.1, y: -2 }}
              >
                <Badge
                  variant="outline"
                  className="px-3 py-1 bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-colors"
                >
                  {tech}
                </Badge>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons with glassmorphism */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="rounded-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/25 px-8"
                asChild
              >
                <a href="#projects" className="flex items-center gap-2">
                  <Rocket className="w-5 h-5" />
                  View Projects
                </a>
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full bg-white/5 backdrop-blur-sm border-white/20 hover:bg-white/10 px-8"
                asChild
              >
                <a href="#contact" className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Get In Touch
                </a>
              </Button>
            </motion.div>
          </motion.div>


          {/* Scroll indicator with pulse animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2"
          >
            <motion.a
              href="#resume"
              className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-xs uppercase tracking-wider">Scroll to explore</span>
              <div className="relative">
                <ChevronDown className="h-6 w-6" />
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/20"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
