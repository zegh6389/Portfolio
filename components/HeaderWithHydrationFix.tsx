"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import the actual header with no SSR to avoid hydration issues
const DynamicHeader = dynamic(
  () => import("@/components/EnhancedHeader"),
  { 
    ssr: false,
    loading: () => <HeaderPlaceholder />
  }
);

// Static placeholder that matches initial server render
function HeaderPlaceholder() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-4 bg-transparent">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Awais Zegham
              </span>
            </div>
          </div>
          <div className="hidden md:flex items-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              {/* Empty nav placeholder */}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default function HeaderWithHydrationFix() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Clean up any browser extension injected elements
    const cleanupExtensions = () => {
      const extensionElements = document.querySelectorAll('[id*="speechify"], [id*="grammarly"], [class*="speechify"], [class*="grammarly"]');
      extensionElements.forEach(el => {
        if (el.parentNode) {
          el.remove();
        }
      });
    };
    
    cleanupExtensions();
    
    // Run cleanup periodically to catch dynamically injected elements
    const interval = setInterval(cleanupExtensions, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Always render placeholder on server and initial client render
  if (!mounted) {
    return <HeaderPlaceholder />;
  }

  // Only render the actual header after hydration
  return <DynamicHeader />;
}
