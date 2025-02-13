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
      <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"}`}>
        {/* Layout Container */}
        <div className="flex">
          {/* Sidebar Integrada ao Cabeçalho */}
          {user && (
            <div className={`h-screen fixed left-0 top-0 z-50 transition-all duration-300 ${
              sidebarOpen ? "w-64" : "w-0 -translate-x-full"
            } ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
              <AppSidebar />
            </div>
          )}

          {/* Conteúdo Principal */}
          <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"}`}>
            {/* Cabeçalho Fixo */}
            <header className={`sticky top-0 z-40 flex items-center justify-between px-6 py-4 ${
              theme === "dark" 
                ? "bg-gray-900 border-b border-gray-700" 
                : "bg-white border-b border-gray-200"
            }`}>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Menu className="h-6 w-6" />
              </button>

              <nav className="flex-1 flex justify-center space-x-8 mx-4">
                <Link to="/" className="hover:text-primary transition-colors">Início</Link>
                <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                <Link to="/reports" className="hover:text-primary transition-colors">Relatórios</Link>
              </nav>

              <div className="flex items-center gap-4">
                <div className="relative w-48">
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className="w-full pl-4 pr-10 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
                      theme === "dark" 
                        ? "bg-gray-800 border-gray-700 text-white" 
                        : "bg-gray-50 border-gray-200 text-gray-900"
                    }"
                  />
                  <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>

                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                  <Bell className="h-6 w-6" />
                </button>

                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                  <User className="h-6 w-6" />
                </button>
              </div>
            </header>

            {/* Área de Conteúdo */}
            <main className="p-8">
              {location.pathname === "/empresas" && (
                <div className="mb-6 max-w-2xl">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar empresas..."
                      className="w-full pl-4 pr-10 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
                        theme === "dark" 
                          ? "bg-gray-800 border-gray-700 text-white" 
                          : "bg-gray-50 border-gray-200 text-gray-900"
                      }"
                    />
                    <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              )}

              {children}
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default DashboardLayout;