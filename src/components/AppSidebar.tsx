
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  ClipboardCheck,
  History,
  User,
  Settings,
  LogOut,
  Menu,
  FileText,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ui/ThemeContext";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/" },
  { title: "Empresas", icon: Building2, url: "/companies" },
  { title: "Checklists", icon: ClipboardCheck, url: "/new-checklists" },
  { title: "Inspeções", icon: FileText, url: "/inspections" },
  { title: "Usuários", icon: Users, url: "/users" },
  { title: "Relatórios", icon: History, url: "/reports" },
  { title: "Configurações", icon: Settings, url: "/settings" },
  { title: "Perfil", icon: User, url: "/profile" },
];

export function AppSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey && e.key === "b") || e.key === "m") {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Close sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Check on initial load
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/auth");
  };

  // Function to check if a route is active
  const isActive = (url: string) => {
    // Exact match
    if (location.pathname === url) return true;
    
    // Check for active sub-route (for nested routes)
    if (url !== '/' && location.pathname.startsWith(url)) return true;
    
    return false;
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 shadow-lg z-50",
        isOpen ? "w-64" : "w-16"
      )}
    >
      {/* Menu Button - Positioned at the top */}
      <div className="flex justify-center p-4">
        <button
          aria-label={isOpen ? "Fechar menu lateral" : "Abrir menu lateral"}
          className="p-2 bg-accent rounded-md transition-all duration-300 hover:scale-105 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu className="h-5 w-5 text-foreground" />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-130px)]" role="navigation" aria-label="Menu principal">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.url);
          
          return (
            <Link
              key={item.title}
              to={item.url}
              className={cn(
                "flex items-center gap-3 p-2 rounded-md transition-all duration-300 hover:bg-accent hover:text-accent-foreground",
                active && "bg-primary/10 text-primary"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {isOpen && <span className="text-sm">{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button at the bottom */}
      <div className="absolute bottom-4 left-0 w-full p-4">
        <button
          onClick={handleLogout}
          aria-label="Sair"
          className="flex items-center gap-3 p-2 w-full rounded-md transition-all duration-300 hover:bg-destructive hover:text-destructive-foreground focus:outline-none"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          {isOpen && <span className="text-sm">Sair</span>}
        </button>
      </div>
    </aside>
  );
}
