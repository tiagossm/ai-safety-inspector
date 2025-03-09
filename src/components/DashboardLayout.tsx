
import { ReactNode, useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ui/ThemeContext";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { 
  Search, Bell, User, Menu, Building, ClipboardList, 
  Settings, LogOut, WifiOff, X, Home, BarChart, 
  CheckSquare, FileText, AlertTriangle, Users, Key, CreditCard,
  ShieldAlert
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
import { ChevronDown, ChevronRight } from "lucide-react";
import { AuthUser } from "@/hooks/auth/useAuthState";

interface DashboardLayoutProps {
  children?: ReactNode;
}

interface MenuItem {
  icon: React.ElementType;
  name: string;
  path: string;
  submenu?: MenuItem[];
  roleRequired?: "super_admin" | "company_admin" | "consultant" | "technician";
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

  const typedUser = user as AuthUser | null;
  const isSuperAdmin = typedUser?.tier === "super_admin";

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

  // Nova estrutura de menu com submenus
  const navigation: MenuItem[] = [
    {
      icon: Home,
      name: "Dashboard",
      path: "/dashboard"
    },
    // Admin link only for super admins
    ...(isSuperAdmin ? [
      {
        icon: ShieldAlert,
        name: "Painel Administrativo",
        path: "/admin/dashboard",
        roleRequired: "super_admin"
      } as MenuItem
    ] : []),
    {
      icon: Building,
      name: "Empresas",
      path: "/companies",
      submenu: [
        {
          icon: CheckSquare,
          name: "Checklists",
          path: "/checklists"
        },
        {
          icon: ClipboardList,
          name: "Inspeções",
          path: "/inspections"
        },
        {
          icon: AlertTriangle,
          name: "Ocorrências",
          path: "/incidents"
        }
      ]
    },
    {
      icon: FileText,
      name: "Relatórios",
      path: "/reports"
    },
    {
      icon: Settings,
      name: "Configurações",
      path: "/settings",
      submenu: [
        {
          icon: Users,
          name: "Usuários",
          path: "/users"
        },
        {
          icon: Key,
          name: "Permissões",
          path: "/permissions"
        },
        {
          icon: CreditCard,
          name: "Assinaturas",
          path: "/billing"
        }
      ]
    }
  ];

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

  // Renderiza um item de menu se o usuário tiver a permissão necessária
  const renderMenuItem = (item: MenuItem) => {
    // Verificar se o usuário tem permissão para ver este item
    if (item.roleRequired && typedUser?.tier !== item.roleRequired) {
      return null;
    }

    const hasSubmenu = !!item.submenu?.length;
    const isMenuActive = isSubmenuActive(item);

    if (!hasSubmenu) {
      return (
        <Link
          key={item.name}
          to={item.path}
          className={cn(
            "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
            "hover:bg-muted",
            isActive(item.path) && "bg-primary/10 text-primary"
          )}
        >
          <item.icon className="h-5 w-5" />
          <span>{item.name}</span>
        </Link>
      );
    }

    return (
      <Collapsible
        key={item.name}
        open={openMenus[item.name.toLowerCase()] || isMenuActive}
        onOpenChange={() => toggleMenu(item.name.toLowerCase())}
        className="w-full"
      >
        <CollapsibleTrigger asChild>
          <div 
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer",
              "hover:bg-muted",
              isMenuActive && "bg-primary/10 text-primary"
            )}
          >
            <div className="flex items-center space-x-3">
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </div>
            {openMenus[item.name.toLowerCase()] ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-8 space-y-1 mt-1">
          {item.submenu?.map(subItem => (
            <Link
              key={subItem.name}
              to={subItem.path}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                "hover:bg-muted",
                isActive(subItem.path) && "bg-primary/10 text-primary"
              )}
            >
              <subItem.icon className="h-4 w-4" />
              <span>{subItem.name}</span>
            </Link>
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
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

          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {navigation.map(renderMenuItem)}
            
            <Button
              variant="ghost"
              className="flex items-center justify-start space-x-3 px-3 py-2 w-full hover:bg-muted"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span>Sair</span>
            </Button>
          </nav>
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
