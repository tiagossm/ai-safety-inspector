import { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ui/ThemeContext";
import { Link } from "react-router-dom";
import { Search, Bell, User } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const { theme } = useTheme();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        {user && (
          <div className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border/40">
            <AppSidebar />
          </div>
        )}

        {/* Cabeçalho fixo no topo */}
        {user && (
          <header
            className={`fixed top-0 right-0 left-64 flex items-center justify-between px-10 py-4 shadow-md transition-all duration-300 ${theme === "light" ? "bg-white border-b border-gray-300 text-gray-900" : "bg-gray-800 text-white"}`}
          >
            {/* Navegação superior */}
            <nav className="flex space-x-10 text-lg font-medium">
              <Link to="/" className="hover:underline transition-all duration-200">Página Inicial</Link>
              <Link to="/dashboard" className="hover:underline transition-all duration-200">Dashboard</Link>
              <Link to="/reports" className="hover:underline transition-all duration-200">Relatórios</Link>
            </nav>

            {/* Campo de pesquisa refinado */}
            <div className="relative w-1/4 max-w-lg">
              <input 
                type="text" 
                placeholder="Buscar..." 
                className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600" 
                aria-label="Buscar no sistema"
              />
              <Search className="absolute right-3 top-2.5 text-gray-500" />
            </div>

            {/* Ícones de notificações e perfil */}
            <div className="flex items-center space-x-8">
              <button aria-label="Notificações" className="hover:text-primary transition-all duration-200">
                <Bell className="h-6 w-6 text-gray-500" />
              </button>
              <div className="relative group cursor-pointer">
                <User className="h-8 w-8 text-gray-500" />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 shadow-lg rounded-md p-2 hidden group-hover:block">
                  <Link to="/profile" className="block px-4 py-2 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">Perfil</Link>
                  <Link to="/settings" className="block px-4 py-2 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">Configurações</Link>
                  <Link to="/logout" className="block px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600">Sair</Link>
                </div>
              </div>
            </div>
          </header>
        )}

        <main
          className={`flex-1 p-10 transition-all duration-300 ${user ? "ml-64 mt-20" : "ml-0"}`}
        >
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

export default DashboardLayout;
