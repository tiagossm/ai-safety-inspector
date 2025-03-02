
import { useState } from "react";
import { X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { CompanySwitcher } from "@/components/company/CompanySwitcher";
import { MainNavigation } from "@/components/navigation/MainNavigation";
import { AuthUser } from "@/contexts/AuthContext";

interface DashboardSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  user: AuthUser | null;
  handleLogout: () => Promise<void>;
}

export function DashboardSidebar({
  sidebarOpen,
  setSidebarOpen,
  user,
  handleLogout
}: DashboardSidebarProps) {
  const isMobile = useIsMobile();

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

        <div className="p-4 border-b">
          {user?.tier === "super_admin" && (
            <div className="mb-2 font-semibold text-sm text-primary">
              Modo Super Admin
            </div>
          )}
          {user?.tier !== "super_admin" && (
            <CompanySwitcher />
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <MainNavigation />

          <div className="px-2 mt-6">
            <Button
              variant="ghost"
              className="flex items-center justify-start space-x-3 px-3 py-2 w-full hover:bg-muted"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
