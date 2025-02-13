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
      <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
        {/* Layout Container */}
        <div className="flex">
          {/* Sidebar Integrada */}
          {user && (
            <div className={`fixed top-0 left-0 h-screen z-50 transition-all duration-300 ${
              sidebarOpen ? "w-64" : "w-0 -translate-x-full"
            } ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
              <div className={`${sidebarOpen ? "block" : "hidden"} h-full overflow-y-auto`}>
                <AppSidebar />
              </div>
            </div>
          )}

          {/* Conteúdo Principal */}
          <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"}`}>
            {/* Cabeçalho */}
            {user && (
              <header className={`sticky top-0 flex items-center justify-between px-6 py-4 ${
                theme === "dark" ? "bg-gray-900 border-b border-gray-700" : "bg-white border-b border-gray-200"
              }`}>
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Menu className="h-6 w-6" />
                </button>

                <nav className="flex-1 flex justify-center space-x-8">
                  <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                  <Link to="/reports" className="hover:text-primary transition-colors">Relatórios</Link>
                  <Link to="/settings" className="hover:text-primary transition-colors">Configurações</Link>
                </nav>

                <div className="flex items-center gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar..."
                      className="pl-4 pr-10 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      style={{
                        background: theme === "dark" ? "#1F2937" : "#F3F4F6",
                        borderColor: theme === "dark" ? "#374151" : "#E5E7EB"
                      }}
                    />
                    <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>

                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <Bell className="h-6 w-6" />
                  </button>

                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <User className="h-6 w-6" />
                  </button>
                </div>
              </header>
            )}

            {/* Área de Conteúdo */}
            <main className="p-8">
              {location.pathname === "/empresas" && (
                <div className="mb-6 max-w-2xl">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar empresas..."
                      className="w-full pl-4 pr-10 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      style={{
                        background: theme === "dark" ? "#1F2937" : "#F3F4F6",
                        borderColor: theme === "dark" ? "#374151" : "#E5E7EB"
                      }}
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