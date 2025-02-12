
import { LayoutDashboard, Building2, ClipboardCheck, History, User, Menu, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarTrigger,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Logo } from "./Logo";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/" },
  { title: "Empresas", icon: Building2, url: "/companies" },
  { title: "Inspeções", icon: ClipboardCheck, url: "/inspections" },
  { title: "Relatórios", icon: History, url: "/reports" },
  { title: "Perfil", icon: User, url: "/profile" },
];

export function AppSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key === 'b') || e.key === 'm') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <Sidebar 
        className={cn(
          "fixed left-0 top-0 h-screen bg-gray-900 border-r border-gray-800 z-50 transition-all duration-300",
          isOpen ? 'w-64' : isHovered ? 'w-20' : 'w-16',
          "hover:shadow-xl"
        )}
        onMouseEnter={() => !isOpen && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <SidebarTrigger 
          className={cn(
            "absolute top-4 right-4 z-50 p-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-all duration-300",
            "hover:scale-105 active:scale-95"
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu className="h-5 w-5 text-white" />
        </SidebarTrigger>

        <SidebarHeader className="p-4 flex items-center justify-center border-b border-gray-800">
          {isOpen ? <Logo size="small" /> : null}
        </SidebarHeader>

        <SidebarContent className="p-4">
          <SidebarGroup>
            {isOpen && <SidebarGroupLabel className="text-gray-400">Menu</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link 
                        to={item.url} 
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-800 transition-all duration-300",
                          !isOpen ? 'justify-center' : '',
                          "hover:scale-105 active:scale-95"
                        )}
                        title={!isOpen ? item.title : undefined}
                      >
                        <item.icon className="h-5 w-5 text-gray-400" />
                        {isOpen && <span className="text-gray-300">{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {!isOpen && !isHovered && (
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "fixed left-16 top-1/2 -translate-y-1/2 z-40",
            "p-2 bg-gray-800 hover:bg-gray-700 rounded-r-md transition-all duration-300",
            "opacity-30 hover:opacity-100",
            "group"
          )}
          title="Expandir menu (Ctrl+B ou M)"
        >
          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-white" />
        </button>
      )}
    </>
  );
}
