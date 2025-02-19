
import { ReactNode, useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ui/ThemeContext";
import { Link, useLocation, Outlet } from "react-router-dom";
import { Search, Bell, User, Menu, Building, ClipboardList, Settings, LogOut, WifiOff } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

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
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    // Fechar sidebar quando em mobile
    if (isMobile) {
      setSidebarOpen(false);
    }

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, [isMobile]);

  const handlers = useSwipeable({
    onSwipedLeft: () => setSidebarOpen(false),
    onSwipedRight: () => setSidebarOpen(true),
  });

  return (
    <div className="min-h-screen flex bg-background" {...handlers}>
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transition-transform duration-200 ease-in-out",
          "lg:translate-x-0 lg:relative",
          !sidebarOpen && "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden mb-2"
              onClick={() => setSidebarOpen(false)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h2 className="text-lg font-semibold">Dashboard</h2>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {[
              { icon: Building, name: "Empresas", path: "/empresas" },
              { icon: User, name: "Usuários", path: "/users" },
              { icon: ClipboardList, name: "Inspeções", path: "/inspecoes" },
              { icon: Settings, name: "Configurações", path: "/configuracoes" },
              { icon: LogOut, name: "Sair", path: "/logout" },
            ].map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                  "hover:bg-muted",
                  location.pathname === item.path && "bg-primary/10 text-primary"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-200",
        "lg:ml-64",
        sidebarOpen && "lg:ml-64"
      )}>
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container mx-auto px-4 h-16">
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-6 w-6" />
                </Button>
                <div className="hidden md:flex md:w-72 lg:w-80">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder="Buscar..."
                    className="w-full px-3 py-1 bg-transparent border-none focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {!isOnline && <WifiOff className="h-5 w-5 text-destructive" />}
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={toggleTheme}>
                  {theme === "dark" ? "🌙" : "☀️"}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 container mx-auto px-4 py-6">
          <Outlet />
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default DashboardLayout;
