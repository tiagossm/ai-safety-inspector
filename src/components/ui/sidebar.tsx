
import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";

export interface SidebarProviderProps {
  children: ReactNode;
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  return <>{children}</>;
}

interface MenuItemProps {
  icon: React.ElementType;
  label: string;
  route?: string;
  hasSubmenu?: boolean;
  children?: ReactNode;
  onClick?: () => void;
  isActive?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function MenuItem({
  icon: Icon,
  label,
  route,
  hasSubmenu = false,
  children,
  onClick,
  isActive = false,
  isOpen = false,
  onToggle
}: MenuItemProps) {
  const location = useLocation();
  const active = isActive || (route && location.pathname === route);
  
  if (hasSubmenu) {
    return (
      <Collapsible
        open={isOpen}
        onOpenChange={onToggle}
        className="w-full"
      >
        <CollapsibleTrigger asChild>
          <div 
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer",
              "hover:bg-muted",
              active && "bg-primary/10 text-primary"
            )}
            onClick={onClick}
          >
            <div className="flex items-center space-x-3">
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </div>
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-8 space-y-1 mt-1">
          {children}
        </CollapsibleContent>
      </Collapsible>
    );
  }
  
  if (route) {
    return (
      <Link
        to={route}
        className={cn(
          "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
          "hover:bg-muted",
          active && "bg-primary/10 text-primary"
        )}
        onClick={onClick}
      >
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </Link>
    );
  }
  
  return (
    <div
      className={cn(
        "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors cursor-pointer",
        "hover:bg-muted",
        active && "bg-primary/10 text-primary"
      )}
      onClick={onClick}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </div>
  );
}

export function SubMenu({ children }: { children: ReactNode }) {
  return <div className="space-y-1">{children}</div>;
}
