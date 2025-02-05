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
    <Sidebar className="border-r border-gray-800 fixed left-0 top-0 h-full w-64 bg-gray-900 z-50">
      <SidebarTrigger className="absolute top-4 left-4 z-50 p-2 bg-gray-800 hover:bg-gray-700 rounded-md">
        <Menu className="h-6 w-6 text-white" />
      </SidebarTrigger>

      <SidebarHeader className="p-4 flex items-center justify-center border-b border-gray-800">
        <Logo size="small" />
      </SidebarHeader>

      <SidebarContent className="p-4">
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