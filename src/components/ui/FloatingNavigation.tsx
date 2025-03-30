
import React, { useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingNavigationProps {
  threshold?: number; // Scroll threshold in pixels to show the navigation
}

export function FloatingNavigation({ threshold = 300 }: FloatingNavigationProps) {
  const [showNav, setShowNav] = useState(false);
  
  // Track scroll position to show/hide navigation
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const pageHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      
      // Only show if we can actually scroll (page is taller than viewport)
      // and we've scrolled past the threshold
      const canScroll = pageHeight > viewportHeight + 100; // Add some margin
      setShowNav(canScroll && scrollY > threshold);
    };
    
    window.addEventListener('scroll', handleScroll);
    // Check initial state
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);
  
  // Scroll to top of the page
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  // Scroll to bottom of the page
  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };
  
  if (!showNav) return null;
  
  return (
    <div className="fixed right-4 bottom-4 flex flex-col gap-2 z-50">
      <Button 
        variant="secondary" 
        size="icon" 
        className="h-10 w-10 rounded-full shadow-md"
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <ChevronUp className="h-5 w-5" />
      </Button>
      
      <Button 
        variant="secondary" 
        size="icon" 
        className="h-10 w-10 rounded-full shadow-md"
        onClick={scrollToBottom}
        aria-label="Scroll to bottom"
      >
        <ChevronDown className="h-5 w-5" />
      </Button>
    </div>
  );
}
