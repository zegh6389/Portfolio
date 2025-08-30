"use client";

import * as React from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { motion, useInView, Variants } from "framer-motion";
import { cn } from "@/lib/utils";



interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number; // seconds before typing starts
  duration?: number; // total seconds for full line
  once?: boolean;
  caretClassName?: string; // custom styles for caret
  showCaretAfterFinish?: boolean; // keep caret blinking after finished
  respectReducedMotion?: boolean; // if false, ignore prefers-reduced-motion for this instance
}

export function TypewriterText({ text, className, delay = 0, duration = 2, caretClassName, showCaretAfterFinish = false, respectReducedMotion = true }: AnimatedTextProps) {
  const [displayedText, setDisplayedText] = React.useState("");
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isTyping, setIsTyping] = React.useState(false);
  const reducedMotionPref = useReducedMotion();
  const reducedMotion = respectReducedMotion ? reducedMotionPref : false;

  React.useEffect(() => {
    if (reducedMotion) {
      setDisplayedText(text);
      setCurrentIndex(text.length);
      return;
    }
    const startTimeout = setTimeout(() => setIsTyping(true), delay * 1000);
    return () => clearTimeout(startTimeout);
  }, [delay, reducedMotion, text]);

  React.useEffect(() => {
    if (!isTyping || reducedMotion) return;

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, (duration * 1000) / text.length);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, duration, isTyping, reducedMotion]);

  return (
    <span className={cn("inline-block", className)}>
      {displayedText}
  {(currentIndex < text.length || showCaretAfterFinish) && !reducedMotion && (
        <motion.span
          aria-hidden
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
          className={cn(
            "inline-block align-middle ml-1 w-[3px] h-[1.2em] rounded-sm bg-current shadow-[0_0_6px_currentColor]",
            caretClassName,
            currentIndex < text.length ? '' : 'animate-pulse'
          )}
        />
      )}
    </span>
  );
}

export function GlitchText({ text, className }: { text: string; className?: string }) {
  const [isGlitching, setIsGlitching] = React.useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 200);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className={cn("relative inline-block", className)}>
      <span className="relative z-10">{text}</span>
      {isGlitching && (
        <>
          <span
            className="absolute top-0 left-0 text-cyan-500 opacity-70"
            style={{ transform: "translate(-2px, -2px)" }}
          >
            {text}
          </span>
          <span
            className="absolute top-0 left-0 text-red-500 opacity-70"
            style={{ transform: "translate(2px, 2px)" }}
          >
            {text}
          </span>
        </>
      )}
    </span>
  );
}

export function WaveText({ text, className, delay = 0 }: AnimatedTextProps) {
  const letters = text.split("");

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: () => ({
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: delay },
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
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.span
      className={cn("inline-flex", className)}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {letters.map((letter, index) => (
        <motion.span key={index} variants={child}>
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.span>
  );
}

export function GradientText({ text, className, gradient = "from-primary to-purple-600" }: AnimatedTextProps & { gradient?: string }) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.span
      ref={ref}
      className={cn(
        "inline-block bg-gradient-to-r bg-clip-text text-transparent",
        gradient,
        className
      )}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.5 }}
    >
      {text}
    </motion.span>
  );
}

export function RotatingText({ 
  words, 
  className 
}: { 
  words: string[]; 
  className?: string;
}) {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <span className={cn("relative inline-block", className)}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="absolute left-0 top-0"
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: i === index ? 1 : 0,
            y: i === index ? 0 : -10,
          }}
          transition={{ duration: 0.3 }}
        >
          {word}
        </motion.span>
      ))}
      <span className="invisible">{words[0]}</span>
    </span>
  );
}

export function ScrambleText({ text, className }: AnimatedTextProps) {
  const [scrambledText, setScrambledText] = React.useState(text);
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  
  React.useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setScrambledText(
        text
          .split("")
          .map((letter, index) => {
            if (index < iteration) {
              return text[index];
            }
            return letters[Math.floor(Math.random() * 26)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }

      iteration += 1 / 3;
    }, 30);

    return () => clearInterval(interval);
  }, [text, letters]);

  return <span className={className}>{scrambledText}</span>;
}
