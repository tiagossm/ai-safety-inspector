
import { ReactNode, useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ui/ThemeContext";
import { Link, useLocation, Outlet } from "react-router-dom";
import { Bell, User, Menu, Building, ClipboardList, Settings, LogOut, WifiOff, X } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children?: ReactNode;
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();

  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const updateOnlineStatus = async () => {
      setIsOnline(navigator.onLine);
    };
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Update sidebar state when screen size changes
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const handlers = useSwipeable({
    onSwipedLeft: () => setSidebarOpen(false),
    onSwipedRight: () => setSidebarOpen(true),
    trackMouse: false
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full relative" {...handlers}>
        {/* Overlay for mobile */}
        {sidebarOpen && isMobile && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <aside className={cn(
          "fixed left-0 top-0 h-full z-50 transition-all duration-300",
          theme === "dark" ? "bg-gray-800" : "bg-white",
          sidebarOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full lg:translate-x-0 lg:w-20",
          "shadow-lg border-r border-gray-700"
        )}>
          <div className="flex flex-col items-center py-4 h-full">
            <div className="flex w-full px-4 justify-between items-center mb-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-3 rounded-full bg-emerald-700 hover:bg-emerald-600 transition-colors"
              >
                <Menu className="h-6 w-6 text-white" />
              </button>
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-2 rounded-full hover:bg-gray-700/30"
                >
                  <X className="h-6 w-6" />
                </button>
              )}
            </div>

            <nav className="flex-1 space-y-4 w-full px-2">
              {[
                { icon: <Building />, name: "Empresas", path: "/empresas" },
                { icon: <User />, name: "Usuários", path: "/users" },
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
                  {(sidebarOpen || isMobile) && <span className="text-sm">{item.name}</span>}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className={cn(
          "min-h-screen flex flex-col transition-all duration-300",
          sidebarOpen ? "lg:ml-64" : "lg:ml-20"
        )}>
          <header className={cn(
            "fixed top-0 right-0 h-16 z-40 flex items-center justify-between px-4 lg:px-8 w-full",
            theme === "dark" ? "bg-gray-900 border-b border-gray-700" : "bg-white border-b border-gray-200",
            sidebarOpen ? "lg:left-64" : "lg:left-20"
          )}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-700/30 rounded-lg"
            >
              <Menu className="h-6 w-6" />
            </button>

            <nav className="hidden lg:flex space-x-8">
              {["pagina-inicial", "dashboard", "relatorios"].map((path) => (
                <Link key={path} to={`/${path}`} className="hover:text-emerald-400 transition-colors">
                  {path.replace("-", " ")}
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-4 lg:space-x-6">
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

          <main className="flex-1 pt-24 px-4 lg:px-8">
            <Outlet />
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default DashboardLayout;
