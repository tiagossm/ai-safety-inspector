
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarMenu } from "./SidebarMenu";
import { AuthUser } from "@/hooks/auth/useAuthState";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  user: AuthUser | null;
  onLogout: () => Promise<void>;
  isMobile: boolean;
}

export function Sidebar({ 
  sidebarOpen, 
  setSidebarOpen, 
  user, 
  onLogout, 
  isMobile 
}: SidebarProps) {
  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transition-all duration-300 ease-in-out",
      "lg:translate-x-0 lg:relative",
      !sidebarOpen && "-translate-x-full"
    )}>
      <div className="flex flex-col h-full">
        <div className="p-4 border-b flex items-center justify-between">
          <Logo className="w-32" />
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <SidebarMenu 
          user={user} 
          onLogout={onLogout} 
        />
      </div>
    </aside>
  );
}
