import { ReactNode, useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ui/ThemeContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Bell, User, Menu } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/auth");
  };

  return (
    <SidebarProvider>
      <div className={`flex min-h-screen transition-all duration-300 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
        
        {/* Sidebar com largura dinâmica */}
        {user && (
          <div className={`fixed left-0 top-0 h-screen ${sidebarOpen ? "w-64" : "w-0"} transition-all duration-300 bg-card border-r border-border/40 shadow-md overflow-hidden`}>
            <AppSidebar />
          </div>
        )}

        {/* Cabeçalho ajustável */}
        {user && (
          <header className={`fixed top-0 right-0 flex items-center justify-between px-8 py-4 shadow-md transition-all duration-300 ${sidebarOpen ? "left-64" : "left-0"} ${theme === "light" ? "bg-white border-b border-gray-300" : "bg-gray-800 border-b border-gray-700"}`}>
            
            {/* Botão do menu hambúrguer */}
            <button 
              className="p-2 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-md transition-all"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Navegação centralizada */}
            <nav className="flex-1 flex justify-center space-x-10 text-lg font-medium">
              <Link to="/" className="hover:underline transition-all">Página Inicial</Link>
              <Link to="/dashboard" className="hover:underline transition-all">Dashboard</Link>
              <Link to="/reports" className="hover:underline transition-all">Relatórios</Link>
            </nav>

            {/* Área direita com busca e ícones */}
            <div className="flex items-center gap-6">
              <div className="relative w-48">
                <input 
                  type="text" 
                  placeholder="Buscar..." 
                  className="w-full pl-4 pr-12 py-2 rounded-md border focus:outline-none focus:ring-2 text-gray-800 dark:text-white bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-500" />
              </div>

              <div className="flex items-center gap-4">
                <button aria-label="Notificações">
                  <Bell className="h-6 w-6 text-gray-500 hover:text-primary transition-all" />
                </button>
                <button aria-label="Perfil">
                  <User className="h-8 w-8 text-gray-500 hover:text-primary transition-all" />
                </button>
              </div>
            </div>
          </header>
        )}

        {/* Conteúdo principal ajustável */}
        <main className={`flex-1 p-10 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"} mt-20`}>
          
          {/* Barra de busca condicional para empresas */}
          {location.pathname === "/empresas" && (
            <div className="relative w-1/2 mb-6">
              <input 
                type="text" 
                placeholder="Buscar empresas..." 
                className="w-full pl-4 pr-12 py-2 rounded-md border focus:outline-none focus:ring-2 text-gray-800 dark:text-white bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-500" />
            </div>
          )}

          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

export default DashboardLayout;