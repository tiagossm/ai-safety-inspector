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
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/" },
  { title: "Empresas", icon: Building2, url: "/companies" },
  { title: "Inspeções", icon: ClipboardCheck, url: "/inspections" },
  { title: "Relatórios", icon: History, url: "/reports" },
  { title: "Configurações", icon: Settings, url: "/settings" },
  { title: "Perfil", icon: User, url: "/profile" },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  // Memoriza a função de tratamento de eventos para evitar re-renderizações desnecessárias
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
    localStorage.removeItem("authToken"); // Ajuste conforme seu sistema de autenticação
    navigate("/login");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 shadow-lg",
        isOpen ? "w-64" : "w-20"
      )}
    >
      <button
        aria-label={isOpen ? "Fechar menu lateral" : "Abrir menu lateral"}
        className="absolute top-4 right-4 p-2 bg-accent rounded-md transition-all duration-300 hover:scale-105 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu className="h-5 w-5 text-foreground" />
      </button>

      <div className="p-4 flex items-center justify-center border-b border-border">
        {isOpen && <span className="text-lg font-bold">IA SST</span>}
      </div>

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
              <Icon className="h-5 w-5 text-foreground" aria-hidden="true" />
              {isOpen && <span className="text-foreground">{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-0 w-full p-4">
        <button
          onClick={handleLogout}
          aria-label="Sair"
          className="flex items-center gap-3 p-2 w-full rounded-md transition-all duration-300 hover:bg-destructive hover:text-destructive-foreground focus:outline-none"
        >
          <LogOut className="h-5 w-5" aria-hidden="true" />
          {isOpen && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}
