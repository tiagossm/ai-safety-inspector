
import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AuthUser } from "@/hooks/auth/useAuthState";
import {
  Building, ClipboardList, Home, Settings, LogOut,
  CheckSquare, FileText, AlertTriangle, Users, Key, CreditCard,
  ShieldAlert, BarChart
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";

export interface MenuItem {
  icon: React.ElementType;
  name: string;
  path: string;
  submenu?: MenuItem[];
  roleRequired?: "super_admin" | "company_admin" | "consultant" | "technician";
}

interface SidebarMenuProps {
  user: AuthUser | null;
  onLogout: () => Promise<void>;
}

export function SidebarMenu({ user, onLogout }: SidebarMenuProps) {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    companies: true
  });

  const isSuperAdmin = user?.tier === "super_admin";

  const toggleMenu = (key: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Menu structure with submenus
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
    if (item.roleRequired && user?.tier !== item.roleRequired) {
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
    <nav className="flex-1 overflow-y-auto p-4 space-y-2">
      {navigation.map(renderMenuItem)}
      
      <Button
        variant="ghost"
        className="flex items-center justify-start space-x-3 px-3 py-2 w-full hover:bg-muted"
        onClick={onLogout}
      >
        <LogOut className="h-5 w-5" />
        <span>Sair</span>
      </Button>
    </nav>
  );
}
