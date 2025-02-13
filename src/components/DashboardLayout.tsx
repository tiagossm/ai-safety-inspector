import { ReactNode, useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ui/ThemeContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Bell, User, Menu, X } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation(); // Captura a URL atual
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/auth");
  };

  const NavLinks = () => (
    <nav className="flex space-x-10 text-lg font-medium">
      {[
        { to: "/", label: "Página Inicial" },
        { to: "/dashboard", label: "Dashboard" },
        { to: "/reports", label: "Relatórios" },
      ].map(({ to, label }) => (
        <Link key={to} to={to} className="hover:underline transition-all duration-200">
          {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <SidebarProvider>
      <div className={`flex min-h-screen transition-all duration-300 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
        
        {/* Sidebar ajustada para sumir completamente quando fechada */}
        {user && (
          <div className={`fixed left-0 top-0 h-screen ${sidebarOpen ? "w-64" : "w-0"} transition-all duration-300 overflow-hidden bg-card border-r border-border/40 shadow-md`}>
            {sidebarOpen && <AppSidebar />}
          </div>
        )}

        {/* Cabeçalho que ajusta a largura automaticamente */}
        {user && (
          <header className={`fixed top-0 right-0 flex items-center justify-between px-8 py-4 shadow-md transition-all duration-300 ${sidebarOpen ? "left-64" : "left-0"} ${theme === "light" ? "bg-white border-b border-gray-300 text-gray-900" : "bg-gray-800 text-white border-b border-gray-700"}`}>
            
            {/* Botão de Expandir/Recolher Sidebar */}
            <button 
              className="p-2 rounded-md transition-all duration-300 hover:bg-gray-300 dark:hover:bg-gray-700"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <NavLinks />

            {/* Campo de pesquisa global */}
            <div className="relative w-1/4 max-w-lg">
              <input 
                type="text" 
                placeholder="Buscar..." 
                className="w-full pl-4 pr-12 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 dark:text-white bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-sm" 
                aria-label="Buscar no sistema"
              />
              <button className="absolute right-3 top-2.5 text-gray-500 hover:text-primary transition-all">
                <Search />
              </button>
            </div>

            {/* Ícones de Notificações e Perfil */}
            <div className="flex items-center space-x-6">
              <button aria-label="Notificações" className="hover:text-primary transition-all duration-200">
                <Bell className="h-6 w-6 text-gray-500" />
              </button>

              {/* Menu de perfil */}
              <div className="relative">
                <button aria-label="Abrir menu do usuário">
                  <User className="h-8 w-8 text-gray-500 hover:text-primary transition-all" />
                </button>
              </div>
            </div>
          </header>
        )}

        {/* Conteúdo principal agora se ajusta automaticamente */}
        <main className={`flex-1 p-10 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"} mt-20`}>
          
          {/* Exibe a barra de pesquisa de empresas APENAS na tela de Empresas */}
          {location.pathname === "/empresas" && (
            <div className="relative w-1/2 max-w-xl mb-6">
              <input 
                type="text" 
                placeholder="Buscar empresas..." 
                className="w-full pl-4 pr-12 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 dark:text-white bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-sm" 
                aria-label="Buscar empresas"
              />
              <button className="absolute right-3 top-2.5 text-gray-500 hover:text-primary transition-all">
                <Search />
              </button>
            </div>
          )}

          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

export default DashboardLayout;
