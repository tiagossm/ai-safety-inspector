import { ReactNode, useState, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ui/ThemeContext";
import { Link, useLocation, Outlet } from "react-router-dom";
import { Search, Bell, User, Menu, Building, ClipboardList, Settings, LogOut, WifiOff } from "lucide-react";
import { useMediaQuery } from "react-responsive";
import { useSwipeable } from "react-swipeable";
import { db } from "@/services/database";
import { SyncManager } from "@/services/sync";

interface DashboardLayoutProps {
  children?: ReactNode;
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const syncManager = new SyncManager();

  // Atualiza status online/offline
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) syncManager.trySync();
    };
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  // Animação do Sidebar Mobile (Swipe)
  const handlers = useSwipeable({
    onSwipedLeft: () => setSidebarOpen(false),
    onSwipedRight: () => setSidebarOpen(true),
  });

  return (
    <SidebarProvider>
      <div className={`min-h-screen flex ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"}`} {...handlers}>
        
        {/* Sidebar */}
        <aside className={`fixed left-0 top-0 h-screen z-50 transition-all duration-300
          ${theme === "dark" ? "bg-gray-800" : "bg-white"}
          ${sidebarOpen ? "w-64" : "w-20"} shadow-lg border-r border-gray-700`}
        >
          <div className="flex flex-col items-center py-4 h-full">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-3 mb-4 rounded-full bg-emerald-700 hover:bg-emerald-600 transition-colors"
            >
              <Menu className="h-6 w-6 text-white" />
            </button>

            {/* Navegação da Sidebar */}
            <nav className="flex-1 space-y-4 w-full px-2">
              {[
                { icon: <Building />, name: "Empresas", path: "/empresas" },
                { icon: <ClipboardList />, name: "Inspeções", path: "/inspecoes" },
                { icon: <Settings />, name: "Configurações", path: "/configuracoes" },
                { icon: <LogOut />, name: "Sair", path: "/logout" },
              ].map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`w-full p-3 flex items-center transition-colors rounded-lg hover:bg-gray-700/30 group relative 
                    ${sidebarOpen ? "justify-start gap-3" : "justify-center"} 
                    ${location.pathname === item.path ? "bg-gray-700/20" : ""}`}
                >
                  {item.icon}
                  {sidebarOpen && <span className="text-sm">{item.name}</span>}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Conteúdo principal */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
          
          {/* Navbar */}
          <header className={`fixed top-0 right-0 h-16 z-40 flex items-center justify-between px-8 
            ${theme === "dark" ? "bg-gray-900 border-b border-gray-700" : "bg-white border-b border-gray-200"}
            ${sidebarOpen ? "left-64" : "left-20"}`}
          >
            <nav className="flex space-x-8">
              {["pagina-inicial", "dashboard", "relatorios"].map((path) => (
                <Link key={path} to={`/${path}`} className="hover:text-emerald-400 transition-colors">
                  {path.replace("-", " ")}
                </Link>
              ))}
            </nav>

            {/* Status de Conexão + Ícones */}
            <div className="flex items-center space-x-6">
              {!isOnline && <WifiOff className="h-6 w-6 text-red-500" title="Offline" />}
              <button className="hover:text-emerald-400 transition-colors">
                <Bell className="h-6 w-6" />
              </button>
              <button className="hover:text-emerald-400 transition-colors">
                <User className="h-8 w-8" />
              </button>
              <button onClick={toggleTheme} className="p-2 rounded-md bg-gray-700 text-white hover:bg-gray-600 transition-colors">
                {theme === "dark" ? "🌙" : "☀️"}
              </button>
            </div>
          </header>

          {/* Área de Conteúdo */}
          <main className="flex-1 pt-24 px-8">
            {location.pathname === "/empresas" && (
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">Empresas Cadastradas</h1>
                <div className="relative w-1/2 max-w-xl">
                  <input
                    type="text"
                    placeholder="Buscar empresas..."
                    className="w-full pl-4 pr-12 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary 
                      text-gray-800 dark:text-white bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-sm"
                    aria-label="Buscar empresas"
                  />
                  <button className="absolute right-3 top-2.5 text-gray-500 hover:text-primary transition-all">
                    <Search />
                  </button>
                </div>
              </div>
            )}

            {/* Renderiza páginas internas */}
            <Outlet />
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default DashboardLayout;
