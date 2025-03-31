
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";

interface FloatingNavigationProps {
  threshold?: number;
}

export function FloatingNavigation({ threshold = 300 }: FloatingNavigationProps) {
  const [showButtons, setShowButtons] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setShowButtons(window.scrollY > (threshold || 300));
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  const scrollToBottom = () => {
    window.scrollTo({ 
      top: document.documentElement.scrollHeight, 
      behavior: "smooth" 
    });
  };
  
  if (!showButtons) return null;
  
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
      <Button 
        size="sm" 
        variant="secondary" 
        className="rounded-full w-10 h-10 p-0 shadow-md"
        onClick={scrollToTop}
      >
        <ChevronUp className="h-5 w-5" />
      </Button>
      <Button 
        size="sm" 
        variant="secondary" 
        className="rounded-full w-10 h-10 p-0 shadow-md"
        onClick={scrollToBottom}
      >
        <ChevronDown className="h-5 w-5" />
      </Button>
    </div>
  );
}
