"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, Minus, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatWidgetProps {
  open: boolean;
  minimized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onRestore: () => void;
}

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  content: string;
  pending?: boolean;
}

export function ChatWidget({ open, minimized, onClose, onMinimize, onRestore }: ChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: "welcome",
    role: "bot",
    content: "Hi! I'm Awais's assistant. Ask anything about skills, projects, services, or how to contact him.",
  }]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, minimized]);

  useEffect(() => {
    if (scrollRef.current && open && !minimized) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, minimized]);

  const send = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    const userMsg: ChatMessage = { id: Date.now()+"-u", role: "user", content: text };
    setMessages(prev => [...prev, userMsg, { id: Date.now()+"-p", role: "bot", content: "Thinking...", pending: true }]);
    setInput("");
    // Simulated bot reply
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.pending ? { ...m, pending: false, content: generateReply(text) } : m));
    }, 900);
  }, [input]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* Minimized pill */}
      <AnimatePresence>
    {open && minimized && (
          <motion.button
            key="chat-min"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={onRestore}
      className="fixed bottom-8 right-4 sm:right-6 z-[70] flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/50 via-purple-600/50 to-pink-600/50 text-white text-sm font-medium shadow-lg backdrop-blur-md border border-white/20"
            aria-label="Restore chat"
          >
            <MessageSquare className="w-4 h-4" /> Chat
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {open && !minimized && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.6 }}
            className="fixed bottom-28 right-4 sm:right-6 z-[70] w-[min(380px,90vw)] pointer-events-auto"
            role="dialog" aria-label="Chat bot" aria-modal="true"
          >
            <div className={cn(
              "relative rounded-2xl overflow-hidden border",
              "border-white/20 dark:border-white/10 backdrop-blur-xl",
              "bg-gradient-to-br from-background/80 via-background/70 to-background/60"
            )}>
              <div className="absolute inset-0 pointer-events-none rounded-2xl ring-1 ring-white/10" />
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/30 via-purple-600/30 to-pink-600/30 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-sm font-medium">Chat Support</h2>
                <div className="ml-auto flex items-center gap-1">
                  <button onClick={onMinimize} aria-label="Minimize chat" className="p-1 rounded-md hover:bg-white/10 transition-colors text-foreground/70 hover:text-foreground">
                    <Minus className="w-4 h-4" />
                  </button>
                  <button onClick={onClose} aria-label="Close chat" className="p-1 rounded-md hover:bg-white/10 transition-colors text-foreground/70 hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div ref={scrollRef} className="max-h-[340px] overflow-y-auto px-4 py-3 space-y-3 text-sm custom-scrollbar">
                {messages.map(m => (
                  <div key={m.id} className={cn("flex", m.role === 'user' ? 'justify-end' : 'justify-start')}> 
                    <div className={cn(
                      "px-3 py-2 rounded-xl leading-snug shadow-sm",
                      m.role === 'user'
                        ? 'bg-gradient-to-r from-primary/60 via-purple-600/60 to-pink-600/60 text-white'
                        : 'bg-white/10 dark:bg-white/5 text-foreground/90 backdrop-blur-sm border border-white/10'
                    )}>
                      {m.content}
                      {m.pending && <span className="ml-1 animate-pulse">…</span>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Type your question..."
                    className="flex-1 bg-white/10 dark:bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-foreground/40"
                  />
                  <button
                    onClick={send}
                    disabled={!input.trim()}
                    className="px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-primary/60 via-purple-600/60 to-pink-600/60 text-white hover:from-primary/70 hover:via-purple-600/70 hover:to-pink-600/70 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >Send</button>
                </div>
                <p className="mt-1 text-[10px] text-foreground/40">AI demo responses are simulated.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function generateReply(userText: string): string {
  const lower = userText.toLowerCase();
  if (/[h?]elp|support|hi|hello/.test(lower)) return "Hello! How can I assist with your project or questions?";
  if (/price|rate|cost/.test(lower)) return "I offer flexible freelance rates. Share project details and I can estimate.";
  if (/stack|tech|technology/.test(lower)) return "I work with Next.js, React, TypeScript, Tailwind, Node.js & 3D (three.js).";
  if (/contact|email/.test(lower)) return "You can use the contact section or the email button below.";
  return "Got it! I'll note that. Ask about stack, pricing, or anything else.";
}

// ESC key close handler at top-level (hook-like) - optional enhancement
// Placed outside component to avoid redefinition; could also be inside with useEffect.
