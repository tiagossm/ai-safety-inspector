
import { ReactNode, useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ui/ThemeContext";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { 
  Search, Bell, User, Menu, Building, ClipboardList, 
  Settings, LogOut, WifiOff, X, Home, BarChart, 
  CheckSquare, FileText, AlertTriangle, Users, Key, CreditCard
} from "lucide-react";
import { useSwipeable } from "react-swipeable";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Logo } from "./Logo";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CompanySwitcher } from "./company/CompanySwitcher";
import { MainNavigation } from "./navigation/MainNavigation";
import { ChevronDown, ChevronRight } from "lucide-react";

interface DashboardLayoutProps {
  children?: ReactNode;
}

interface MenuItem {
  icon: React.ElementType;
  name: string;
  path: string;
  submenu?: MenuItem[];
}

function DashboardLayout({
  children
}: DashboardLayoutProps) {
  const {
    theme,
    toggleTheme
  } = useTheme();
  const {
    user,
    logout
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    companies: true
  });

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
    onSwipedLeft: () => isMobile && setSidebarOpen(false),
    onSwipedRight: () => isMobile && setSidebarOpen(true)
  });

  const toggleMenu = (key: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  // Verifica se um item de menu está ativo (rota atual)
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Verifica se uma seção de submenu está ativa (qualquer subrota)
  const isSubmenuActive = (menu: MenuItem) => {
    if (isActive(menu.path)) return true;
    
    if (menu.submenu) {
      return menu.submenu.some(subItem => isActive(subItem.path));
    }
    
    return false;
  };

  return (
    <div className="min-h-screen flex bg-background" {...handlers}>
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transition-all duration-300 ease-in-out",
        "lg:translate-x-0 lg:relative",
        !sidebarOpen && "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b flex items-center justify-between">
            <Logo className="w-32" />
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-4 border-b">
            {user?.tier === "super_admin" && (
              <div className="mb-2 font-semibold text-sm text-primary">
                Modo Super Admin
              </div>
            )}
            {user?.tier !== "super_admin" && (
              <CompanySwitcher />
            )}
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <MainNavigation />

            <div className="px-2 mt-6">
              <Button
                variant="ghost"
                className="flex items-center justify-start space-x-3 px-3 py-2 w-full hover:bg-muted"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container mx-auto">
            <div className="flex h-14 items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                  <Menu className="h-5 w-5" />
                </Button>
                <div className="hidden md:flex md:flex-1 max-w-xl">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="search"
                      placeholder="Buscar..."
                      className="w-full h-9 rounded-md border border-input bg-transparent px-9 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-4">
                {!isOnline && <WifiOff className="h-5 w-5 text-destructive" />}
                <Button variant="ghost" size="icon" className="hidden md:inline-flex">
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
        <div className="flex-1 container mx-auto py-6">
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
