import { 
  LayoutDashboard, Building2, ClipboardCheck, History, User, Menu, ArrowRight, Settings 
} from "lucide-react";
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
  { title: "Configurações", icon: Settings, url: "/settings" },
  { title: "Perfil", icon: User, url: "/profile" },
];

export function AppSidebar() {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key === 'b') || e.key === 'm') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <Sidebar 
        className={cn(
          "fixed left-0 top-0 h-screen bg-gray-900 dark:bg-gray-800 border-r border-gray-700 transition-all duration-300",
          isOpen ? "w-64" : "w-16"
        )}
      >
        {/* Botão para ocultar/exibir a sidebar */}
        <SidebarTrigger 
          className="absolute top-4 right-4 p-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-all duration-300"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu className="h-5 w-5 text-white" />
        </SidebarTrigger>

        {/* Header do Sidebar */}
        <SidebarHeader className="p-4 flex items-center justify-center border-b border-gray-800">
          {isOpen ? <Logo size="small" /> : null}
        </SidebarHeader>

        {/* Conteúdo do Sidebar */}
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
                        className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-800 transition-all duration-300"
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

      {/* ✅ Novo botão para reexibir a sidebar quando oculta */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed left-2 top-10 p-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-all duration-300"
          title="Expandir menu (Ctrl+B ou M)"
        >
          <ArrowRight className="h-4 w-4 text-white" />
        </button>
      )}
    </>
  );
}
