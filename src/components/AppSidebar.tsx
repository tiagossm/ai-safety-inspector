
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  ClipboardCheck,
  History,
  User,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ui/ThemeContext";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
  { title: "Empresas", icon: Building2, url: "/companies" },
  { title: "Inspeções", icon: ClipboardCheck, url: "/inspections" },
  { title: "Relatórios", icon: History, url: "/reports" },
  { title: "Configurações", icon: Settings, url: "/settings" },
  { title: "Perfil", icon: User, url: "/profile" },
];

export function AppSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { logout } = useAuth();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey && e.key === "b") || e.key === "m") {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleLogout = async () => {
    try {
      console.log("AppSidebar: Initiating logout...");
      await supabase.auth.signOut();
      console.log("AppSidebar: Supabase signOut completed");
      
      // Call our own logout function to clear state
      await logout();
      
      navigate("/auth");
    } catch (error) {
      console.error("Error during logout:", error);
      // Still try to navigate to auth page even if there's an error
      navigate("/auth");
    }
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 shadow-lg",
        isOpen ? "w-64" : "w-16"
      )}
    >
      {/* Botão do Menu - Posicionado no topo */}
      <div className="flex justify-center p-4">
        <button
          aria-label={isOpen ? "Fechar menu lateral" : "Abrir menu lateral"}
          className="p-2 bg-accent rounded-md transition-all duration-300 hover:scale-105 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu className="h-5 w-5 text-foreground" />
        </button>
      </div>

      {/* Menu de navegação */}
      <nav className="p-4 space-y-2" role="navigation" aria-label="Menu principal">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              to={item.url}
              className={cn(
                "flex items-center gap-3 p-2 rounded-md transition-all duration-300 hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5 text-foreground" aria-hidden="true" />
              {isOpen && <span className="text-foreground">{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Botão de Logout na parte inferior */}
      <div className="absolute bottom-4 left-0 w-full p-4">
        <button
          onClick={handleLogout}
          aria-label="Sair"
          className="flex items-center gap-3 p-2 w-full rounded-md transition-all duration-300 hover:bg-destructive hover:text-destructive-foreground focus:outline-none"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
          {isOpen && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}
