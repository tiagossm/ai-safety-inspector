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

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/" },
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

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/auth");
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
          <Menu className="h-5 w-5 text-foreground" /> {/* Ícone ajustado */}
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
              <Icon className="h-3.5 w-3.5 text-foreground" aria-hidden="true" /> {/* Ícone reduzido em 1.75x */}
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
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" /> {/* Ícone reduzido em 1.75x */}
          {isOpen && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}
