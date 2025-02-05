import { LayoutDashboard, Building2, ClipboardCheck, History, User, Menu } from "lucide-react";
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

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/" },
  { title: "Empresas", icon: Building2, url: "/companies" },
  { title: "Inspeções", icon: ClipboardCheck, url: "/inspections" },
  { title: "Relatórios", icon: History, url: "/reports" },
  { title: "Perfil", icon: User, url: "/profile" },
];

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-gray-800">
      <SidebarHeader className="p-4 flex items-center justify-between">
        <Logo size="small" />
        <SidebarTrigger className="fixed z-50 p-6 hover:bg-muted rounded-md">
          <Menu className="h-12 w-12 text-gray-400" />
        </SidebarTrigger>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.url} 
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-800 transition-colors"
                    >
                      <item.icon className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-300">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}