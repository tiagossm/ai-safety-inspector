import { ReactNode, useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ui/ThemeContext";
import { Link, useLocation, Outlet } from "react-router-dom";
import { Search, Bell, User, Menu, Building, ClipboardList, Settings, LogOut, WifiOff } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { db } from "@/services/database"; // ✅ Correção: Importando IndexedDB corretamente
import { SyncManager } from "@/services/sync"; // ✅ Correção: Importando SyncManager corretamente

interface DashboardLayoutProps {
  children?: ReactNode;
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const syncManager = new SyncManager(); // ✅ Correção: Garantindo que SyncManager esteja inicializado

  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [localEmpresas, setLocalEmpresas] = useState([]);

  // Atualiza status online/offline e sincroniza dados quando necessário
  useEffect(() => {
    const updateOnlineStatus = async () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) await syncManager.trySync(); // ✅ Agora só chama se estiver online
    };
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  // Carrega dados do IndexedDB no modo offline
  useEffect(() => {
    const loadOfflineData = async () => {
      try {
        const dbInstance = await db;
        const tx = dbInstance.transaction("empresas", "readonly");
        const storedData = await tx.store.getAll();
        setLocalEmpresas(storedData);
      } catch (error) {
        console.error("Erro ao carregar dados locais:", error);
      }
    };

    if (!isOnline) loadOfflineData();
  }, [isOnline]);

  // Animação do Sidebar Mobile (Swipe)
  const handlers = useSwipeable({
    onSwipedLeft: () => setSidebarOpen(false),
    onSwipedRight: () => setSidebarOpen(true),
  });

  return (
    <SidebarProvider>
      <div className={cn("min-h-screen flex", theme === "dark" ? "bg-gray-900" : "bg-gray-100")} {...handlers}>
        
        {/* Sidebar */}
        <aside className={cn(
          "fixed left-0 top-0 h-screen z-50 transition-all duration-300",
          theme === "dark" ? "bg-gray-800" : "bg-white",
          sidebarOpen ? "w-64" : "w-20",
          "shadow-lg border-r border-gray-700"
        )}>
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
                  className={cn(
                    "w-full p-3 flex items-center transition-colors rounded-lg hover:bg-gray-700/30 group relative",
                    sidebarOpen ? "justify-start gap-3" : "justify-center",
                    location.pathname === item.path ? "bg-gray-700/20" : ""
                  )}
                >
                  {item.icon}
                  {sidebarOpen && <span className="text-sm">{item.name}</span>}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Conteúdo principal */}
        <div className={cn("flex-1 flex flex-col transition-all duration-300", sidebarOpen ? "ml-64" : "ml-20")}>
          
          {/* Navbar */}
          <header className={cn(
            "fixed top-0 right-0 h-16 z-40 flex items-center justify-between px-8",
            theme === "dark" ? "bg-gray-900 border-b border-gray-700" : "bg-white border-b border-gray-200",
            sidebarOpen ? "left-64" : "left-20"
          )}>
            <nav className="flex space-x-8">
              {["pagina-inicial", "dashboard", "relatorios"].map((path) => (
                <Link key={path} to={`/${path}`} className="hover:text-emerald-400 transition-colors">
                  {path.replace("-", " ")}
                </Link>
              ))}
            </nav>

            {/* Status de Conexão + Ícones */}
            <div className="flex items-center space-x-6">
              {!isOnline && <WifiOff className="h-6 w-6 text-red-500" aria-label="Offline" />}
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
            <Outlet />
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default DashboardLayout;
