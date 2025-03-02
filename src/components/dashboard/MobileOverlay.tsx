
import { cn } from "@/lib/utils";

interface MobileOverlayProps {
  sidebarOpen: boolean;
  isMobile: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function MobileOverlay({ sidebarOpen, isMobile, setSidebarOpen }: MobileOverlayProps) {
  if (!sidebarOpen || !isMobile) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
      onClick={() => setSidebarOpen(false)} 
    />
  );
}
