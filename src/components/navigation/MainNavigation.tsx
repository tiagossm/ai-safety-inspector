
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { 
  Home, Building, BarChart, ClipboardList, Search, 
  AlertTriangle, Settings, ChevronRight 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  active?: boolean;
}

export function NavItem({ icon, label, path, active }: NavItemProps) {
  const navigate = useNavigate();
  
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-2 px-3 py-2 text-left",
        active && "bg-primary/10 text-primary"
      )}
      onClick={() => navigate(path)}
    >
      {icon}
      <span>{label}</span>
      <ChevronRight className="ml-auto h-4 w-4" />
    </Button>
  );
}

export function MainNavigation() {
  const { user } = useAuth();
  const pathname = window.location.pathname;
  
  return (
    <nav className="space-y-1 px-2 py-4">
      {/* Super Admin */}
      {user?.tier === 'super_admin' && (
        <>
          <NavItem 
            icon={<Home className="h-5 w-5" />} 
            label="Visão Plataforma" 
            path="/admin/dashboard" 
            active={pathname === "/admin/dashboard"}
          />
          <NavItem 
            icon={<Building className="h-5 w-5" />} 
            label="Todas Empresas" 
            path="/admin/companies" 
            active={pathname === "/admin/companies"}
          />
          <NavItem 
            icon={<BarChart className="h-5 w-5" />} 
            label="Analytics Global" 
            path="/admin/analytics" 
            active={pathname === "/admin/analytics"}
          />
        </>
      )}

      {/* Clientes */}
      {user?.tier !== 'super_admin' && (
        <>
          <NavItem 
            icon={<Home className="h-5 w-5" />} 
            label="Meu Dashboard" 
            path="/dashboard" 
            active={pathname === "/dashboard"}
          />
          <NavItem 
            icon={<ClipboardList className="h-5 w-5" />} 
            label="Checklists" 
            path="/checklists" 
            active={pathname === "/checklists"}
          />
          <NavItem 
            icon={<Search className="h-5 w-5" />} 
            label="Inspeções" 
            path="/inspections" 
            active={pathname === "/inspections"}
          />
          <NavItem 
            icon={<AlertTriangle className="h-5 w-5" />} 
            label="Ocorrências" 
            path="/incidents" 
            active={pathname === "/incidents"}
          />
        </>
      )}

      {/* Comum */}
      <NavItem 
        icon={<Settings className="h-5 w-5" />} 
        label="Configurações" 
        path="/settings" 
        active={pathname === "/settings"}
      />
    </nav>
  );
}
