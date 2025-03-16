
import {
  Home,
  Building2,
  Settings,
  HelpCircle,
  LogOut,
  User,
  Plus,
  LayoutDashboard,
  ClipboardCheck,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface SidebarMenuProps {
  user: any;
  onLogout: () => void;
}

export function SidebarMenu({ user, onLogout }: SidebarMenuProps) {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  const toggleMenu = (menuId: string) => {
    setOpenMenus((prevOpenMenus) => ({
      ...prevOpenMenus,
      [menuId]: !prevOpenMenus[menuId],
    }));
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto py-2">
        <ul className="space-y-1 px-2">
          <li>
            <Link
              to="/dashboard"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start",
                location.pathname === "/dashboard" && "bg-muted"
              )}
            >
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/companies"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start",
                location.pathname.startsWith("/companies") && "bg-muted"
              )}
            >
              <Building2 className="mr-2 h-4 w-4" />
              Empresas
            </Link>
          </li>
          <li>
            <Link
              to="/checklists"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start",
                location.pathname.startsWith("/checklists") && "bg-muted"
              )}
            >
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Checklists
            </Link>
          </li>
          <li>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="units">
                <AccordionTrigger
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "w-full justify-start",
                    location.pathname.startsWith("/units") && "bg-muted"
                  )}
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  Unidades
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="ml-4 space-y-1">
                    <li>
                      <Link
                        to="/units/add"
                        className={cn(
                          buttonVariants({ variant: "ghost" }),
                          "w-full justify-start text-sm",
                          location.pathname === "/units/add" && "bg-muted"
                        )}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Unidade
                      </Link>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </li>
          <li>
            <Link
              to="/settings"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start",
                location.pathname === "/settings" && "bg-muted"
              )}
            >
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </Link>
          </li>
          <li>
            <Link
              to="/help"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start",
                location.pathname === "/help" && "bg-muted"
              )}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              Ajuda
            </Link>
          </li>
        </ul>
      </div>
      <div className="p-4">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Logado como: {user?.email}
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );
}
